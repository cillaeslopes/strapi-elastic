import React from "react";
import Wrapper from "./Wrapper";
import LeftMenuItem from "../../components/LeftMenuItem";

const LeftMenu = ({ models, activeModel, setActiveModel }) => {
  console.log(
    "🚀 ~ file: index.js ~ line 7 ~ LeftMenu ~ activeModel",
    activeModel
  );

  return (
    <Wrapper>
      <h4 className="p-3">Models</h4>
      <hr />
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
    </Wrapper>
  );
};

export default LeftMenu;
