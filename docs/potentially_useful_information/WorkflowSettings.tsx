import { styled } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PageGrid } from "../../components/Shared.styles";
import Sidebar from "../../components/Sidebar";
import { ComponentTypesSetting } from "../../components/WorkflowSettingsComponents/ComponentTypesSetting";
import { LocationsSetting } from "../../components/WorkflowSettingsComponents/LocationsSetting";
import { MarketsSetting } from "../../components/WorkflowSettingsComponents/MarketsSetting";
import { RegionsSetting } from "../../components/WorkflowSettingsComponents/RegionsSetting";
import { RequestComponentStatusesSetting } from "../../components/WorkflowSettingsComponents/RequestComponentStatusesSetting";
import { RequestStatusesSetting } from "../../components/WorkflowSettingsComponents/RequestStatusesSetting";
import { RequestTypesSetting } from "../../components/WorkflowSettingsComponents/RequestTypesSetting";
import { ResourcesSetting } from "../../components/WorkflowSettingsComponents/ResourcesSetting";
import { TeamsSetting } from "../../components/WorkflowSettingsComponents/TeamsSetting";
import { PlansAndProjectsReduxStore } from "../../types/PlansAndProjectReduxStore";

const StSettingsContainer = styled("div")`
  display: flex;
  grid-column: span 12;
  padding: var(--sm-6xl, 2rem);
`;

const StSettingsContent = styled("div")`
  background-color: var(--color-contrast-ultralower);
  margin-left: var(--sm-6xl, 2rem);
  width: 100%;
  --bfs-table-row-content-icon-text-color: var(--color-primary, #0077c7);
  --bfs-table-row-content-icon-text-font-weight: var(
    --rol-primary-text-weight,
    bold
  );
  --bfs-table-row-content-styled-string-font-weight: normal;
  --bfs-table-row-content-styled-string-text-color: var(--color-black, #000000);
  --bfs-table-header-background-color: var(
    --color-contrast-ultralower,
    #f7f7f7
  );
  --bfs-table-row-content-font-weight: var(--font-weight-light, 300);
  --bfs-table-row-content-font-size: var(--sp-xs, 12px);
  --bfs-table-row-content-line-height: var(--sp-lg, 16px);
  --bfs-modal-width: 768px;
  --bfs-ellipses-actions-container: var(--sp-5xs, 5px);
  --bfs-ellipses-options-container: 0;
`;

const StCustomerViewContainer = styled("div")`
  font-size: var(--sp-lg, 16px);
  font-weight: var(--font-weight-medium, 500);
  padding: var(--sp-2xl, 20px) 0;
  text-align: center;
`;

type WorkflowSettingsTitles = Record<string, string>;

type SettingsContentsMap = Record<string, JSX.Element>;

type SidebarItem = {
  title: string;
  subNav?: SidebarItem[];
};

const workflowSettingsTitles: WorkflowSettingsTitles = {
  regions: "Regions",
  markets: "Markets",
  locations: "Locations",
  teams: "Teams",
  resources: "Resources",
  servicesAndComponents: "Services & Components",
  requestTypes: "Request Types",
  componentTypes: "Component Types",
  requestStatuses: "Request Statuses",
  requestComponentStatuses: "Component Statuses"
};

const sidebarData: SidebarItem[] = [
  {
    title: workflowSettingsTitles.regions
  },
  {
    title: workflowSettingsTitles.markets
  },
  {
    title: workflowSettingsTitles.locations
  },
  {
    title: workflowSettingsTitles.teams
  },
  {
    title: workflowSettingsTitles.resources
  },
  {
    title: workflowSettingsTitles.servicesAndComponents,
    subNav: [
      {
        title: workflowSettingsTitles.requestTypes
      },
      {
        title: workflowSettingsTitles.componentTypes
      },
      {
        title: workflowSettingsTitles.requestStatuses
      },
      {
        title: workflowSettingsTitles.requestComponentStatuses
      }
    ]
  }
];

const settingsContents: SettingsContentsMap = {
  [workflowSettingsTitles.regions]: <RegionsSetting />,
  [workflowSettingsTitles.markets]: <MarketsSetting />,
  [workflowSettingsTitles.locations]: <LocationsSetting />,
  [workflowSettingsTitles.teams]: <TeamsSetting />,
  [workflowSettingsTitles.resources]: <ResourcesSetting />,
  [workflowSettingsTitles.requestTypes]: <RequestTypesSetting />,
  [workflowSettingsTitles.componentTypes]: <ComponentTypesSetting />,
  [workflowSettingsTitles.requestStatuses]: <RequestStatusesSetting />,
  [workflowSettingsTitles.requestComponentStatuses]: (
    <RequestComponentStatusesSetting />
  )
};

function WorkflowSettings() {
  const [activeMenu, setActiveMenu] = useState("");

  const userState = useSelector(
    (state: PlansAndProjectsReduxStore) => state.user
  );
  const { updateCrumbs } = useSelector(
    (state: PlansAndProjectsReduxStore) => state.env
  );

  useEffect(() => {
    if (updateCrumbs) {
      updateCrumbs({
        crumbs: [
          { to: "/admin/workflow-management", label: "Workflow Management" },
          { to: "", label: "Workflow Settings" }
        ],
        subText:
          "This is where you can assign service requests to designers and can view their capacity in your selected market"
      });
    }
  }, [updateCrumbs]);

  const onChangeActiveMenu = (title: string) => {
    setActiveMenu(title);
  };

  if (!userState?.data?.isSales) {
    return (
      <StCustomerViewContainer>
        You do not have access to this page.
      </StCustomerViewContainer>
    );
  }

  return (
    <PageGrid>
      <StSettingsContainer>
        <Sidebar
          onChangeActiveMenu={onChangeActiveMenu}
          sidebarData={sidebarData}
          menuHeaderText="SETTINGS FILTER"
        />
        <StSettingsContent>
          {settingsContents[activeMenu] || null}
        </StSettingsContent>
      </StSettingsContainer>
    </PageGrid>
  );
}

export { WorkflowSettings };
