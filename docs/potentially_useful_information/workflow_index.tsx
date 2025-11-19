import { mdiPencilBoxOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { styled } from "@mui/material";
import {
  DataGridPremium,
  GridRowModel,
  GridRowOrderChangeParams
} from "@mui/x-data-grid-premium";
import { GridApiPremium } from "@mui/x-data-grid-premium/models/gridApiPremium";
import { LicenseInfo } from "@mui/x-license";
import { MutableRefObject } from "react";
import {
  ACTIONS_FIELD,
  ACTION_WIDTH,
  MUI_GRID_LICENSE_KEY
} from "../../../lib/constants";
import Toolbar from "./Toolbar";

LicenseInfo.setLicenseKey(MUI_GRID_LICENSE_KEY);

const StEditIconWrapper = styled("div")`
  cursor: pointer;
`;

export interface WorkflowSettingsDataGridProps {
  apiRef?: MutableRefObject<GridApiPremium>;
  data: {
    columnData: any[];
    dataList: any[];
  };
  onReorder?: (value: any) => void;
  onEnterEdit?: (value: any) => void;
  exportable?: boolean;
  pageable: boolean;
  filterable: boolean;
  editable: boolean;
  reorderable?: boolean;
  showQuickFilter?: boolean;
}

const WorkflowSettingsDataGrid: React.FC<WorkflowSettingsDataGridProps> = ({
  apiRef,
  data,
  onReorder,
  onEnterEdit,
  exportable,
  pageable,
  filterable,
  editable,
  reorderable,
  showQuickFilter = false
}) => {
  const updateRowPosition = (
    initialIndex: number,
    newIndex: number,
    rows: Array<GridRowModel>
  ) => {
    const rowsClone = [...rows];
    const row = rowsClone.splice(initialIndex, 1)[0];
    rowsClone.splice(newIndex, 0, row);
    return rowsClone;
  };

  const handleRowOrderChange = (params: GridRowOrderChangeParams) => {
    const newRows = updateRowPosition(
      params.oldIndex,
      params.targetIndex,
      data.dataList
    );

    onReorder?.(newRows);
  };

  const ActionsCell = (params: any) => {
    if (!editable) {
      return null;
    }

    const handleEdit = (e: any) => {
      onEnterEdit?.(params.row);
    };

    return (
      <StEditIconWrapper onClick={handleEdit}>
        <Icon path={mdiPencilBoxOutline} size={1} />
      </StEditIconWrapper>
    );
  };

  const getGridColumns = () => {
    return [
      ...data.columnData.map((column) => ({
        ...column,
        filterable
      })),
      {
        disableColumnMenu: true,
        field: ACTIONS_FIELD,
        headerName: "",
        minWidth: ACTION_WIDTH,
        width: ACTION_WIDTH,
        hideable: false,
        editable: false,
        resizable: false,
        sortable: false,
        filterable: false,
        disableReorder: true,
        disableExport: true,
        renderCell: ActionsCell,
        customViewHidden: true
      }
    ];
  };

  return (
    <DataGridPremium
      apiRef={apiRef}
      pagination
      disableAggregation
      disableRowSelectionOnClick
      disableColumnSelector
      showCellVerticalBorder
      showColumnVerticalBorder
      hideFooterPagination={!pageable}
      pageSizeOptions={[5, 10, 25]}
      columns={getGridColumns()}
      rows={data.dataList}
      rowReordering={reorderable}
      onRowOrderChange={handleRowOrderChange}
      slots={{ toolbar: Toolbar }}
      slotProps={{ toolbar: { exportable, showQuickFilter } }}
      initialState={{
        columns: {
          columnVisibilityModel: {
            [ACTIONS_FIELD]: editable
          }
        }
      }}
      sx={{
        "& .MuiDataGrid-row": {
          backgroundColor: "white"
        }
      }}
    />
  );
};

export default WorkflowSettingsDataGrid;
