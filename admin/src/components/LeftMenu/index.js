import React from "react";
import {
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections
} from "@strapi/design-system/SubNav";
import LeftMenuItem from "../LeftMenuItem";

const LeftMenu = ({ models, activeModel, setActiveModel }) => {
  return (
    <SubNav>
      <SubNavHeader label="Elastic Search" />
      <SubNavSections>
        <SubNavSection label="Models">
          {models && models.length
            ? models.map((model) => (
                <LeftMenuItem
                  label={model.index}
                  onClick={() => setActiveModel(model)}
                  active={model.index === activeModel?.index}
                  enable={model.enabled}
                />
              ))
            : null}
        </SubNavSection>
      </SubNavSections>
    </SubNav>
  );
};

export default LeftMenu;
