<#  Export-Outlook_AllInOne.ps1  (PowerShell 5.x)

Adds:
- HTML body export (to .html files) and/or plain text (to .txt)  [config]
- Date range filters (ReceivedTime)                               [config]
- Excel workbook output (Emails, Folders, SentItems sheets)       [config]
- MAPI fallback for bodies (PR_BODY_W, PR_HTML string, PR_HTML binary)
- Safe-string helper to avoid Int32→String cast errors
- Skips processing the synthetic Store Root folder (processes only its children)

Run:
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\corey.boser\Documents\Export-Outlook_AllInOne.ps1"
#>

# ===================== Configuration =====================
$OutDir                   = Join-Path $env:USERPROFILE "Documents\Outlook_Export"
$DumpSentBodies           = $true         # always dump Sent Items bodies
$DumpAllFoldersBodies     = $false        # $true => dump bodies for every email
$UseHtmlBodies            = $true         # $true => use HTMLBody & .html files; $false => Body & .txt files
$IncludeBodyInExcel       = $true         # put (truncated) body directly in Excel (safe cap)
$ExcelOutput              = $true         # also create an .xlsx with sheets
$MaxItemsPerFolder        = 0             # 0 = no cap
$IncludeHiddenFolders     = $false
$DateFilterFrom           = $null         # e.g. [datetime]"2024-01-01"
$DateFilterTo             = $null         # e.g. [datetime]"2025-12-31 23:59:59"
$ExcludeFolderNameLike    = @("Junk", "RSS", "Conversation History", "Sync Issues", "Clutter")
# =========================================================

# Prep output
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$BodiesDir   = Join-Path $OutDir "Bodies"; New-Item -ItemType Directory -Force -Path $BodiesDir | Out-Null
$TS          = Get-Date -Format "yyyyMMdd_HHmmss"
$FoldersCsv  = Join-Path $OutDir ("Folders_" + $TS + ".csv")
$MsgsCsv     = Join-Path $OutDir ("Messages_Index_" + $TS + ".csv")
$SentCsv     = Join-Path $OutDir ("SentItems_" + $TS + ".csv")
$TreeTxt     = Join-Path $OutDir ("FolderTree_" + $TS + ".txt")
$XlsxPath    = Join-Path $OutDir ("OutlookExport_" + $TS + ".xlsx")

# =============== Helpers ===============
function S { param([object]$o)  # ultra-safe stringify
  try {
    $s = [Convert]::ToString($o)
    if ($null -eq $s) { return "" } else { return $s }
  } catch { return "" }
}
function Q { param([object]$t)  # CSV-quote using S()
  $s = S $t
  return '"' + ($s -replace '"','""') + '"'
}
function Sanitize([object]$sIn) {
    $s = S $sIn
    if ([string]::IsNullOrWhiteSpace($s)) { return "_" }
    $invalid = [IO.Path]::GetInvalidFileNameChars() -join ''
    $re = "[{0}]" -f [RegEx]::Escape($invalid)
    $out = [RegEx]::Replace($s, $re, "_")
    if ($out.Length -gt 120) { $out = $out.Substring(0,120) }
    return $out
}
function Get-SenderSmtp($mail) {
    try {
        $pa = $mail.PropertyAccessor
        $PR_SENDER_SMTP = "http://schemas.microsoft.com/mapi/proptag/0x5D01001F"
        $smtp = $pa.GetProperty($PR_SENDER_SMTP)

        if (-not [string]::IsNullOrWhiteSpace((S $smtp))) { return (S $smtp) }

        if ((S $mail.SenderEmailType) -eq "EX" -and $mail.Sender) {
            $ex = $mail.Sender.GetExchangeUser()
            if ($ex) { return (S $ex.PrimarySmtpAddress) }
        }

        return (S $mail.SenderEmailAddress)
    } catch {
        return (S $mail.SenderEmailAddress)
    }
}
function Build-FolderPath($storeDisplayName, $folder) {
    $storeNameStr = S $storeDisplayName
    $parts = @()
    $f = $folder
    while ($f -ne $null) {
        $nameStr = ""
        try { $nameStr = S $f.Name } catch {}
        $parts += $nameStr
        try { $f = $f.Parent } catch { break }
    }
    $path = ($parts | Select-Object -Skip 1) -join '\'
    if ([string]::IsNullOrWhiteSpace($path)) { return $storeNameStr }
    return ($storeNameStr + "\" + $path)
}
function Should-ExcludeFolder {
    param([object]$folderPath)
    $fp = S $folderPath
    foreach ($needle in $ExcludeFolderNameLike) {
        $n = S $needle
        if ($fp.IndexOf($n, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { return $true }
    }
    return $false
}
# =======================================

# CSV headers
'"Store","FolderPath","FolderName","EntryID","FolderClass","TotalItems","UnreadItems"' | Set-Content -Path $FoldersCsv -Encoding UTF8
'"Store","FolderPath","EntryID","ConversationID","ReceivedTime","SentOn","FromName","FromEmail","To","Subject","AttachmentsCount","SizeKB","BodyFileIfDumped"' | Set-Content -Path $MsgsCsv -Encoding UTF8
'"EntryID","ConversationID","SentOn","To","CC","BCC","Subject","AttachmentsCount","SizeKB","BodyFile"' | Set-Content -Path $SentCsv -Encoding UTF8

# StreamWriters
$treeSW = New-Object System.IO.StreamWriter($TreeTxt, $false, [System.Text.UTF8Encoding]::new($false))
$msgSW  = New-Object System.IO.StreamWriter($MsgsCsv, $true,  [System.Text.UTF8Encoding]::new($false))
$sentSW = New-Object System.IO.StreamWriter($SentCsv, $true,  [System.Text.UTF8Encoding]::new($false))
$folSW  = New-Object System.IO.StreamWriter($FoldersCsv, $true, [System.Text.UTF8Encoding]::new($false))

# Outlook COM
try { $ol = New-Object -ComObject Outlook.Application } catch { throw "Outlook Desktop not found." }
$ns = $ol.GetNamespace("MAPI")
$olFolderSentMail = 5

# Excel (optional)
$excel = $null; $wb = $null
$xlRowEmails = 2; $xlRowFolders = 2; $xlRowSent = 2
$wsEmails = $null; $wsFolders = $null; $wsSent = $null
$maxBodyExcel = 30000

if ($ExcelOutput) {
    try {
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false; $excel.DisplayAlerts = $false
        $wb = $excel.Workbooks.Add()

        # Sheets
        $wsEmails  = $wb.Worksheets.Item(1); $wsEmails.Name  = "Emails"
        $wsFolders = $wb.Worksheets.Add();   $wsFolders.Name = "Folders"
        $wsSent    = $wb.Worksheets.Add();   $wsSent.Name    = "SentItems"

        # Headers
        $headersEmails  = @("Store","FolderPath","FromName","FromEmail","ReceivedTime","SentOn","To","Subject","Attachments","SizeKB","BodyFile","Body")
        $headersFolders = @("Store","FolderPath","FolderName","EntryID","FolderClass","TotalItems","UnreadItems")
        $headersSent    = @("EntryID","ConversationID","SentOn","To","CC","BCC","Subject","Attachments","SizeKB","BodyFile")

        for ($i=0;$i -lt $headersEmails.Count;$i++){ $wsEmails.Cells.Item(1,$i+1).Value2  = $headersEmails[$i] }
        for ($i=0;$i -lt $headersFolders.Count;$i++){ $wsFolders.Cells.Item(1,$i+1).Value2 = $headersFolders[$i] }
        for ($i=0;$i -lt $headersSent.Count;$i++){ $wsSent.Cells.Item(1,$i+1).Value2       = $headersSent[$i] }
    } catch {
        Write-Warning "Excel export disabled: $($_.Exception.Message)"
        $ExcelOutput = $false
    }
}

function Write-FolderRow {
    param($storeName,$folder,$folderPath)
    $storeStr  = S $storeName
    $pathStr   = S $folderPath
    $nameStr   = ""; try { $nameStr = S $folder.Name } catch {}
    $entryId   = ""; try { $entryId = S $folder.EntryID } catch {}
    $cls       = ""; try { $cls = S $folder.DefaultItemType } catch {}
    $total     = 0;  try { $total  = [int]$folder.Items.Count } catch {}
    $unread    = 0;  try { $unread = [int]$folder.UnReadItemCount } catch {}

    $line = @(
        Q($storeStr), Q($pathStr), Q($nameStr), Q($entryId),
        Q($cls), Q([string]$total), Q([string]$unread)
    ) -join ","
    $folSW.WriteLine($line)

    if ($ExcelOutput) {
        $wsFolders.Cells.Item($script:xlRowFolders,1).Value2 = $storeStr
        $wsFolders.Cells.Item($script:xlRowFolders,2).Value2 = $pathStr
        $wsFolders.Cells.Item($script:xlRowFolders,3).Value2 = $nameStr
        $wsFolders.Cells.Item($script:xlRowFolders,4).Value2 = $entryId
        $wsFolders.Cells.Item($script:xlRowFolders,5).Value2 = $cls
        $wsFolders.Cells.Item($script:xlRowFolders,6).Value2 = $total
        $wsFolders.Cells.Item($script:xlRowFolders,7).Value2 = $unread
        $script:xlRowFolders++
    }
}

function Walk-Folder {
    param(
        [Parameter(Mandatory)]$storeName,
        [Parameter(Mandatory)]$folder,
        [int]$depth = 0
    )

    try {
        $storeNameStr = S $storeName

        $isHidden = $false
        try { if ((S $folder.Name) -like "/*") { $isHidden = $true } } catch {}
        if ($isHidden -and -not $IncludeHiddenFolders) { return }

        $folderPath = Build-FolderPath $storeNameStr $folder
        if (Should-ExcludeFolder $folderPath) { return }

        # Folder CSV + Tree + Excel
        Write-FolderRow -storeName $storeNameStr -folder $folder -folderPath $folderPath

        $indent      = ('  ' * $depth)
        $folderName  = ""; try { $folderName = S $folder.Name } catch {}
        $itemsCount  = 0;  try { $itemsCount = [int]$folder.Items.Count } catch {}
        $unreadCount = 0;  try { $unreadCount = [int]$folder.UnReadItemCount } catch {}

        $treeLine = (S $indent) + "- " + (S $folderName) +
                    "  (Items: " + ([string]$itemsCount) + ", Unread: " + ([string]$unreadCount) + ")"
        $treeSW.WriteLine($treeLine)

        # Sent folder?
        $isSentFolder = $false
        try {
            $defSent = $ns.GetDefaultFolder($olFolderSentMail)
            if ((S $folder.EntryID) -eq (S $defSent.EntryID)) { $isSentFolder = $true }
        } catch {}

        # Items loop
        try {
            $items = $folder.Items
            try { $items.Sort("ReceivedTime", $true) | Out-Null } catch {}
            $limit = 0
            try { $limit = [int]$items.Count } catch {}
            if ($MaxItemsPerFolder -gt 0 -and $limit -gt $MaxItemsPerFolder) { $limit = $MaxItemsPerFolder }

            for ($i = 1; $i -le $limit; $i++) {
                $it = $null
                try { $it = $items.Item($i) } catch {}
                if ($null -eq $it) { continue }

                $itClass = $null
                try { $itClass = [int]$it.Class } catch {}
                if ($itClass -ne 43) { continue } # Mail only

                # Date filter (ReceivedTime)
                $recvTime = $null
                try { $recvTime = $it.ReceivedTime } catch {}
                if ($DateFilterFrom) { if ($recvTime -lt $DateFilterFrom) { continue } }
                if ($DateFilterTo)   { if ($recvTime -gt $DateFilterTo)   { continue } }

                # Sender
                $fromName  = ""; try { $fromName = S $it.SenderName } catch {}
                $fromEmail = Get-SenderSmtp $it

                # Times (string)
                $receivedStr = ""; try { if ($it.ReceivedTime) { $receivedStr = $it.ReceivedTime.ToString("yyyy-MM-dd HH:mm:ss") } } catch {}
                $sentStr     = ""; try { if ($it.SentOn)       { $sentStr     = $it.SentOn.ToString("yyyy-MM-dd HH:mm:ss") } } catch {}

                # Fields
                $toStr = ""; $subj = ""; $att = "0"; $sizeKB = "0"
                try { $toStr = S $it.To } catch {}
                try { $subj  = S $it.Subject } catch {}
                try { $att   = [string]$it.Attachments.Count } catch {}
                try { $sizeKB = [string]([Math]::Round($it.Size/1024.0,1)) } catch {}

                # Body dump (file) + body text for Excel (optional)
                $bodyFile = ""; $bodyForExcel = ""
                $fileExt = ".txt"
                if ($UseHtmlBodies) { $fileExt = ".html" }
                if ( ($isSentFolder -and $DumpSentBodies) -or $DumpAllFoldersBodies ) {
                    $stamp = $receivedStr
                    if ($isSentFolder -and $sentStr -ne "") { $stamp = $sentStr }
                    $name  = Sanitize( ($stamp + "_" + $subj) )
                    $path  = Join-Path $BodiesDir ($name + "___" + (Sanitize $it.EntryID) + $fileExt)
                    try {
                        # --- Robust body retrieval with MAPI fallbacks ---
                        $bodyText = ""
                        if ($UseHtmlBodies) { try { $bodyText = S $it.HTMLBody } catch {} }
                        if ([string]::IsNullOrEmpty($bodyText)) { try { $bodyText = S $it.Body } catch {} }
                        if ([string]::IsNullOrEmpty($bodyText)) {
                            try {
                                $pa = $it.PropertyAccessor
                                $mapiTxt = $pa.GetProperty("http://schemas.microsoft.com/mapi/proptag/0x1000001F")  # PR_BODY_W
                                if ($mapiTxt) { $bodyText = (S $mapiTxt) }
                            } catch {}
                        }
                        if ($UseHtmlBodies -and [string]::IsNullOrEmpty($bodyText)) {
                            try {
                                $pa = $it.PropertyAccessor
                                $mapiHtmlStr = $pa.GetProperty("http://schemas.microsoft.com/mapi/proptag/0x1013001E") # PR_HTML (string)
                                if ($mapiHtmlStr) { $bodyText = (S $mapiHtmlStr) }
                            } catch {}
                        }
                        if ($UseHtmlBodies -and [string]::IsNullOrEmpty($bodyText)) {
                            try {
                                $pa = $it.PropertyAccessor
                                $mapiHtmlBin = $pa.GetProperty("http://schemas.microsoft.com/mapi/proptag/0x10130102") # PR_HTML (bin)
                                if ($mapiHtmlBin -and $mapiHtmlBin.Length -gt 0) {
                                    try { $bodyText = [System.Text.Encoding]::UTF8.GetString($mapiHtmlBin) }
                                    catch { $bodyText = [System.Text.Encoding]::Default.GetString($mapiHtmlBin) }
                                }
                            } catch {}
                        }
                        # --- end MAPI fallbacks ---

                        [System.IO.File]::WriteAllText($path, $bodyText, [System.Text.UTF8Encoding]::new($false))
                        $bodyFile = $path
                    } catch {
                        Write-Warning "Body write failed for '$(S $folderPath)' / '$(S $subj)' : $($_.Exception.Message)"
                    }
                }

                if ($IncludeBodyInExcel) {
                    # Repeat robust retrieval for the Excel Body column (truncated)
                    $bodyForExcel = ""
                    if ($UseHtmlBodies) { try { $bodyForExcel = S $it.HTMLBody } catch {} }
                    if ([string]::IsNullOrEmpty($bodyForExcel)) { try { $bodyForExcel = S $it.Body } catch {} }
                    if ([string]::IsNullOrEmpty($bodyForExcel)) {
                        try {
                            $pa = $it.PropertyAccessor
                            $mapiTxt = $pa.GetProperty("http://schemas.microsoft.com/mapi/proptag/0x1000001F")
                            if ($mapiTxt) { $bodyForExcel = (S $mapiTxt) }
                        } catch {}
                    }
                    if ($UseHtmlBodies -and [string]::IsNullOrEmpty($bodyForExcel)) {
                        try {
                            $pa = $it.PropertyAccessor
                            $mapiHtmlStr = $pa.GetProperty("http://schemas.microsoft.com/mapi/proptag/0x1013001E")
                            if ($mapiHtmlStr) { $bodyForExcel = (S $mapiHtmlStr) }
                        } catch {}
                    }
                    if ($UseHtmlBodies -and [string]::IsNullOrEmpty($bodyForExcel)) {
                        try {
                            $pa = $it.PropertyAccessor
                            $mapiHtmlBin = $pa.GetProperty("http://schemas.microsoft.com/mapi/proptag/0x10130102")
                            if ($mapiHtmlBin -and $mapiHtmlBin.Length -gt 0) {
                                try { $bodyForExcel = [System.Text.Encoding]::UTF8.GetString($mapiHtmlBin) }
                                catch { $bodyForExcel = [System.Text.Encoding]::Default.GetString($mapiHtmlBin) }
                            }
                        } catch {}
                    }
                    if ($bodyForExcel -and $bodyForExcel.Length -gt $maxBodyExcel) {
                        $bodyForExcel = $bodyForExcel.Substring(0, $maxBodyExcel)
                    }
                }

                # Messages index CSV
                $msgSW.WriteLine( (@(
                    Q($storeNameStr),
                    Q($folderPath),
                    Q(S $it.EntryID),
                    Q(S $it.ConversationID),
                    Q($receivedStr),
                    Q($sentStr),
                    Q($fromName),
                    Q($fromEmail),
                    Q($toStr),
                    Q($subj),
                    Q($att),
                    Q($sizeKB),
                    Q($bodyFile)
                ) -join ","))

                # Excel row
                if ($ExcelOutput) {
                    $wsEmails.Cells.Item($script:xlRowEmails,1).Value2  = $storeNameStr
                    $wsEmails.Cells.Item($script:xlRowEmails,2).Value2  = $folderPath
                    $wsEmails.Cells.Item($script:xlRowEmails,3).Value2  = $fromName
                    $wsEmails.Cells.Item($script:xlRowEmails,4).Value2  = $fromEmail
                    $wsEmails.Cells.Item($script:xlRowEmails,5).Value2  = $receivedStr
                    $wsEmails.Cells.Item($script:xlRowEmails,6).Value2  = $sentStr
                    $wsEmails.Cells.Item($script:xlRowEmails,7).Value2  = $toStr
                    $wsEmails.Cells.Item($script:xlRowEmails,8).Value2  = $subj
                    $wsEmails.Cells.Item($script:xlRowEmails,9).Value2  = $att
                    $wsEmails.Cells.Item($script:xlRowEmails,10).Value2 = $sizeKB
                    $wsEmails.Cells.Item($script:xlRowEmails,11).Value2 = $bodyFile
                    if ($IncludeBodyInExcel) { $wsEmails.Cells.Item($script:xlRowEmails,12).Value2 = $bodyForExcel }
                    $script:xlRowEmails++
                }

                # Sent-only CSV + Excel
                if ($isSentFolder) {
                    $ccStr = ""; $bccStr = ""
                    try { $ccStr  = S $it.CC } catch {}
                    try { $bccStr = S $it.BCC } catch {}

                    $sentSW.WriteLine( (@(
                        Q(S $it.EntryID), Q(S $it.ConversationID), Q($sentStr),
                        Q($toStr), Q($ccStr), Q($bccStr), Q($subj),
                        Q($att), Q($sizeKB), Q($bodyFile)
                    ) -join ",") )

                    if ($ExcelOutput) {
                        $wsSent.Cells.Item($script:xlRowSent,1).Value2 = S $it.EntryID
                        $wsSent.Cells.Item($script:xlRowSent,2).Value2 = S $it.ConversationID
                        $wsSent.Cells.Item($script:xlRowSent,3).Value2 = $sentStr
                        $wsSent.Cells.Item($script:xlRowSent,4).Value2 = $toStr
                        $wsSent.Cells.Item($script:xlRowSent,5).Value2 = $ccStr
                        $wsSent.Cells.Item($script:xlRowSent,6).Value2 = $bccStr
                        $wsSent.Cells.Item($script:xlRowSent,7).Value2 = $subj
                        $wsSent.Cells.Item($script:xlRowSent,8).Value2 = $att
                        $wsSent.Cells.Item($script:xlRowSent,9).Value2 = $sizeKB
                        $wsSent.Cells.Item($script:xlRowSent,10).Value2 = $bodyFile
                        $script:xlRowSent++
                    }
                }
            }
        } catch {
            Write-Warning "Item read error in '$(S $folderPath)' : $($_.Exception.Message)"
        }

        foreach ($sub in $folder.Folders) {
            Walk-Folder -storeName $storeNameStr -folder $sub -depth ($depth + 1)
        }
    } catch {
        Write-Warning "Folder-level error in '$(S $storeName)\$(S $folder.Name)' : $($_.Exception.Message)"
    }
}

function Process-Children {
    param(
        [Parameter(Mandatory)]$storeName,
        [Parameter(Mandatory)]$rootFolder
    )
    try {
        foreach ($sub in $rootFolder.Folders) {
            Walk-Folder -storeName $storeName -folder $sub -depth 0
        }
    } catch {
        Write-Warning "Store children enumeration error in '$(S $storeName)' : $($_.Exception.Message)"
    }
}

Write-Host "Starting Outlook export..."
foreach ($store in $ns.Stores) {
    try {
        $root = $store.GetRootFolder()
        $name = S $store.DisplayName
        Write-Host ("Walking store: " + $name + " ...")
        # IMPORTANT: Skip the synthetic root itself; only process its children
        Process-Children -storeName $name -rootFolder $root
    } catch {
        Write-Warning "Store error: $($_.Exception.Message)"
    }
}

$treeSW.Close(); $msgSW.Close(); $sentSW.Close(); $folSW.Close()

# Excel finalize
if ($ExcelOutput -and $wb) {
    try {
        foreach ($ws in @($wsEmails,$wsFolders,$wsSent)) {
            if ($ws -ne $null) {
                $lastCol = $ws.UsedRange.Columns.Count
                $ws.Range($ws.Cells.Item(1,1), $ws.Cells.Item(1,$lastCol)).Font.Bold = $true
                $ws.Range($ws.Cells.Item(1,1), $ws.Cells.Item(1,$lastCol)).Interior.ColorIndex = 15
                $ws.Columns.AutoFit() | Out-Null
            }
        }
        $wb.SaveAs($XlsxPath)
        $wb.Close($true) | Out-Null
        $excel.Quit() | Out-Null
        Write-Host "Excel workbook:  $XlsxPath"
    } catch {
        Write-Warning "Excel save error: $($_.Exception.Message)"
        try { if ($wb) { $wb.Close($false) | Out-Null } } catch {}
        try { if ($excel) { $excel.Quit() | Out-Null } } catch {}
    }
}

Write-Host "Done."
Write-Host "Folders CSV:    $FoldersCsv"
Write-Host "Messages CSV:   $MsgsCsv"
Write-Host "Sent CSV:       $SentCsv"
Write-Host "Tree:           $TreeTxt"
Write-Host "Bodies:         $BodiesDir"
