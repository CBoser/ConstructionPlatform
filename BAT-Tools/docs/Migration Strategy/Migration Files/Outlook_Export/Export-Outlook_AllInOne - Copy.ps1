<#  Export-Outlook_AllInOne.ps1  (PowerShell 5.x compatible)

Outputs to:  ~/Documents/Outlook_Export
- Folders_*.csv            -> one row per folder
- Messages_Index_*.csv     -> one row per email (Store, FolderPath, FromName/Email, Received/Sent, Subject, etc.)
- SentItems_*.csv          -> convenience subset for default Sent Items
- FolderTree_*.txt         -> readable folder tree
- Bodies\*.txt             -> plain-text bodies (Sent always; others optional)

Run (bypass if needed):
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\corey.boser\Documents\Export-Outlook_AllInOne.ps1"
#>

# ---------------- Configuration ----------------
$OutDir                   = Join-Path $env:USERPROFILE "Documents\Outlook_Export"
$DumpSentBodies           = $true      # always dump Sent Items bodies
$DumpAllFoldersBodies     = $false     # set $true to dump bodies for every email
$MaxItemsPerFolder        = 0          # 0 = no cap
$IncludeHiddenFolders     = $false
$DateFilterFrom           = $null      # e.g. [datetime]"2024-01-01"
$DateFilterTo             = $null      # e.g. [datetime]"2025-12-31 23:59:59"
$ExcludeFolderNameLike    = @("Junk", "RSS", "Conversation History", "Sync Issues", "Clutter")  # contains match, case-insensitive
# ------------------------------------------------

# Prep output
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$BodiesDir   = Join-Path $OutDir "Bodies"; New-Item -ItemType Directory -Force -Path $BodiesDir | Out-Null
$TS          = Get-Date -Format "yyyyMMdd_HHmmss"
$FoldersCsv  = Join-Path $OutDir ("Folders_" + $TS + ".csv")
$MsgsCsv     = Join-Path $OutDir ("Messages_Index_" + $TS + ".csv")
$SentCsv     = Join-Path $OutDir ("SentItems_" + $TS + ".csv")
$TreeTxt     = Join-Path $OutDir ("FolderTree_" + $TS + ".txt")

# Helpers
function Q { param([string]$t) if ($null -eq $t) { return '""' } else { return '"' + ($t -replace '"','""') + '"' } }
function Sanitize([string]$s) {
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
        if (![string]::IsNullOrWhiteSpace($smtp)) { return $smtp }
        if ($mail.SenderEmailType -eq "EX" -and $mail.Sender) {
            $ex = $mail.Sender.GetExchangeUser()
            if ($ex) { return $ex.PrimarySmtpAddress }
        }
        return $mail.SenderEmailAddress
    } catch { return $mail.SenderEmailAddress }
}
function Build-FolderPath($storeDisplayName, $folder) {
    $parts = @()
    $f = $folder
    while ($f -ne $null) {
        $parts += $f.Name
        try { $f = $f.Parent } catch { break }
    }
    $path = ($parts | Select-Object -Skip 1) -join '\'
    if ([string]::IsNullOrWhiteSpace($path)) { return $storeDisplayName }
    return "$storeDisplayName\$path"
}
function Should-ExcludeFolder([string]$folderPath) {
    foreach ($needle in $ExcludeFolderNameLike) {
        if ($folderPath -match [Regex]::Escape($needle)) { return $true }
    }
    return $false
}

# CSV headers
'"Store","FolderPath","FolderName","EntryID","FolderClass","TotalItems","UnreadItems"' | Set-Content -Path $FoldersCsv -Encoding UTF8
'"Store","FolderPath","EntryID","ConversationID","ReceivedTime","SentOn","FromName","FromEmail","To","Subject","AttachmentsCount","SizeKB","BodyFileIfDumped"' | Set-Content -Path $MsgsCsv -Encoding UTF8
'"EntryID","ConversationID","SentOn","To","CC","BCC","Subject","AttachmentsCount","SizeKB","BodyFile"' | Set-Content -Path $SentCsv -Encoding UTF8

# StreamWriters for faster I/O
$treeSW = New-Object System.IO.StreamWriter($TreeTxt, $false, [System.Text.UTF8Encoding]::new($false))
$msgSW  = New-Object System.IO.StreamWriter($MsgsCsv, $true,  [System.Text.UTF8Encoding]::new($false))
$sentSW = New-Object System.IO.StreamWriter($SentCsv, $true,  [System.Text.UTF8Encoding]::new($false))
$folSW  = New-Object System.IO.StreamWriter($FoldersCsv, $true, [System.Text.UTF8Encoding]::new($false))

# Outlook COM
try { $ol = New-Object -ComObject Outlook.Application } catch { throw "Outlook Desktop not found." }
$ns = $ol.GetNamespace("MAPI")
$olFolderSentMail = 5

function Write-FolderRow {
    param($storeName,$folder,$folderPath)
    $entryId = $folder.EntryID
    $cls     = [string]$folder.DefaultItemType
    $total   = 0; $unread = 0
    try { $total = $folder.Items.Count } catch {}
    try { $unread = $folder.UnReadItemCount } catch {}
    $line = @(
        Q($storeName), Q($folderPath), Q($folder.Name), Q($entryId),
        Q($cls), Q([string]$total), Q([string]$unread)
    ) -join ","
    $folSW.WriteLine($line)
}

function Walk-Folder {
    param(
        [Parameter(Mandatory)]$storeName,
        [Parameter(Mandatory)]$folder,
        [int]$depth = 0
    )

    # Rough hidden detection; skip if configured
    $isHidden = $false
    try { if ($folder.Name -like "/*") { $isHidden = $true } } catch {}
    if ($isHidden -and -not $IncludeHiddenFolders) { return }

    $folderPath = Build-FolderPath $storeName $folder
    if (Should-ExcludeFolder $folderPath) { return }

    # Folder CSV + Tree
    Write-FolderRow -storeName $storeName -folder $folder -folderPath $folderPath
    $indent = ('  ' * $depth)
    $itemsCount = 0; $unreadCount = 0
    try { $itemsCount = $folder.Items.Count } catch {}
    try { $unreadCount = $folder.UnReadItemCount } catch {}
    $treeSW.WriteLine(("{0}- {1}  (Items: {2}, Unread: {3})" -f $indent, $folder.Name, $itemsCount, $unreadCount))

    # Determine if this is the default Sent Items
    $isSentFolder = $false
    try {
        $defSent = $ns.GetDefaultFolder($olFolderSentMail)
        if ($folder.EntryID -eq $defSent.EntryID) { $isSentFolder = $true }
    } catch {}

    # Items loop
    try {
        $items = $folder.Items
        try { $items.Sort("ReceivedTime", $true) | Out-Null } catch {}
        $limit = 0
        try { $limit = $items.Count } catch {}
        if ($MaxItemsPerFolder -gt 0 -and $limit -gt $MaxItemsPerFolder) { $limit = $MaxItemsPerFolder }

        for ($i = 1; $i -le $limit; $i++) {
            $it = $null
            try { $it = $items.Item($i) } catch {}
            if ($null -eq $it) { continue }
            # Mail only (Class 43)
            $itClass = $null
            try { $itClass = $it.Class } catch {}
            if ($itClass -ne 43) { continue }

            # Optional date range filter based on ReceivedTime
            $recvTime = $null
            try { $recvTime = $it.ReceivedTime } catch {}
            if ($DateFilterFrom) { if ($recvTime -lt $DateFilterFrom) { continue } }
            if ($DateFilterTo)   { if ($recvTime -gt $DateFilterTo)   { continue } }

            # Sender info
            $fromName  = ""
            try { $fromName = $it.SenderName } catch {}
            $fromEmail = Get-SenderSmtp $it

            # Times (as strings; avoid inline try in expressions)
            $receivedStr = ""
            try { if ($it.ReceivedTime) { $receivedStr = $it.ReceivedTime.ToString("yyyy-MM-dd HH:mm:ss") } } catch {}
            $sentStr = ""
            try { if ($it.SentOn) { $sentStr = $it.SentOn.ToString("yyyy-MM-dd HH:mm:ss") } } catch {}

            # Subject/To/Size/Attachments
            $toStr = ""; $subj = ""; $att = "0"; $sizeKB = "0"
            try { $toStr = $it.To } catch {}
            try { $subj  = $it.Subject } catch {}
            try { $att   = [string]$it.Attachments.Count } catch {}
            try { $sizeKB = [string]([Math]::Round($it.Size/1024.0,1)) } catch {}

            # Body dump (file path; write only if configured)
            $bodyFile = ""
            if ( ($isSentFolder -and $DumpSentBodies) -or $DumpAllFoldersBodies ) {
                $stamp = $receivedStr
                if ($isSentFolder -and $sentStr -ne "") { $stamp = $sentStr }
                $name  = Sanitize( ($stamp + "_" + $subj) )
                $path  = Join-Path $BodiesDir ($name + "___" + (Sanitize $it.EntryID) + ".txt")
                try {
                    $bodyText = ""
                    try { $bodyText = $it.Body } catch {}
                    [System.IO.File]::WriteAllText($path, $bodyText, [System.Text.UTF8Encoding]::new($false))
                    $bodyFile = $path
                } catch {
                    Write-Warning "Body write failed for '$folderPath' / '$subj' : $($_.Exception.Message)"
                }
            }

            # Messages index CSV
            $msgSW.WriteLine( (@(
                Q($storeName),
                Q($folderPath),
                Q($it.EntryID),
                Q($it.ConversationID),
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

            # Sent-only CSV convenience
            if ($isSentFolder) {
                $ccStr = ""; $bccStr = ""
                try { $ccStr  = $it.CC } catch {}
                try { $bccStr = $it.BCC } catch {}

                $sentOnlyStr = $sentStr
                $sentSW.WriteLine( (@(
                    Q($it.EntryID),
                    Q($it.ConversationID),
                    Q($sentOnlyStr),
                    Q($toStr),
                    Q($ccStr),
                    Q($bccStr),
                    Q($subj),
                    Q($att),
                    Q($sizeKB),
                    Q($bodyFile)
                ) -join ",") )
            }
        }
    } catch {
        Write-Warning "Item read error in '$folderPath' : $($_.Exception.Message)"
    }

    # Recurse
    foreach ($sub in $folder.Folders) {
        Walk-Folder -storeName $storeName -folder $sub -depth ($depth + 1)
    }
}

Write-Host "Starting Outlook export..."
foreach ($store in $ns.Stores) {
    try {
        $root = $store.GetRootFolder()
        $name = $store.DisplayName
        Write-Host "Walking store: $name ..."
        Walk-Folder -storeName $name -folder $root -depth 0
    } catch {
        Write-Warning "Store error: $($_.Exception.Message)"
    }
}

$treeSW.Close(); $msgSW.Close(); $sentSW.Close(); $folSW.Close()
Write-Host "Done."
Write-Host "Folders:        $FoldersCsv"
Write-Host "Messages index: $MsgsCsv"
Write-Host "Sent items:     $SentCsv"
Write-Host "Bodies dir:     $BodiesDir"
Write-Host "Tree:           $TreeTxt"
