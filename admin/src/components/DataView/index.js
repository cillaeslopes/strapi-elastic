import React, { memo, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { request, useNotification } from "@strapi/helper-plugin";
import { isObject } from "lodash";
import { Select } from "@buffetjs/core";
import { Box } from "@strapi/design-system/Box";
import { Button } from "@strapi/design-system/Button";
import { Divider } from "@strapi/design-system/Divider";
import { Flex } from "@strapi/design-system/Flex";
import { Table, Thead, Tbody, Tr, Td, Th } from "@strapi/design-system/Table";
import { Typography } from "@strapi/design-system/Typography";
import { LoadingBar } from "@buffetjs/styles";
import GlobalPagination from "./GlobalPagination";
import Wrapper from "./Wrapper";

const LIMIT_OPTIONS = ["10", "20", "50", "100"];

const DataView = ({
  data = [],
  activeModel = "",
  loading,
  page,
  limit,
  totalCount,
  onChangeParams,
  isMigrateActive,
  isDeleted,
  isCreated,
  refreshData,
}) => {
  const tableHeaders = useMemo(
    () =>
      data && data.length
        ? Object.keys(data[0]).map((d) => ({ name: d, value: d }))
        : [],
    [data]
  );

  const tableData = useMemo(
    () =>
      data && data.length
        ? data.map((dataObject) => {
            let newObj = {};
            if (!dataObject) return newObj;

            for (let key in dataObject) {
              if (isObject(dataObject[key])) {
                newObj[key] = JSON.stringify(dataObject[key], null, 2);
              } else {
                newObj[key] = dataObject[key];
              }
            }

            return newObj;
          })
        : [],
    [data]
  );

  const [isMigrating, setIsMigrating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleNotification = useNotification();

  const migrate = (model) => {
    setIsMigrating(true);
    request(`/elastic/migrate-model`, {
      method: "POST",
      body: { model },
    })
      .then((res) => {
        if (res.success) {
          refreshData();
          toggleNotification({
            type: "success",
            message: `${model} model migrated successfully`,
          });
        } else {
          toggleNotification({
            type: "warning",
            message: "Migration failed",
          });
        }
      })
      .catch(() => {
        toggleNotification({
          type: "warning",
          message: "Migration failed",
        });
      })
      .finally(() => setIsMigrating(false));
  };

  const deleteIndex = (model) => {
    setIsDeleting(true);
    request(`/elastic/delete-index`, {
      method: "POST",
      body: { model },
    })
      .then((res) => {
        if (res.success) {
          refreshData();
          toggleNotification({
            type: "success",
            message: `${model} index deleted`,
          });
        } else {
          toggleNotification({
            type: "warning",
            message: `cannot delete ${model} index`,
          });
        }
      })
      .catch(() => {
        toggleNotification({
          type: "warning",
          message: `cannot delete ${model} index`,
        });
      })
      .finally(() => setIsDeleting(false));
  };

  const createIndex = (model) => {
    setIsCreating(true);
    request(`/elastic/create-index`, {
      method: "POST",
      body: { model },
    })
      .then((res) => {
        refreshData();
        if (res.success) {
          toggleNotification({
            type: "success",
            message: `${model} index created`,
          });
        } else {
          toggleNotification({
            type: "warning",
            message: `cannot create ${model} index`,
          });
        }
      })
      .catch(() => {
        toggleNotification({
          type: "warning",
          message: `cannot create ${model} index`,
        });
      })
      .finally(() => setIsCreating(false));
  };

  return (
    <Wrapper>
      <Box style={{ padding: "10px 0" }}>
        <Typography variant="beta" padding={8}>
          {activeModel?.index?.toUpperCase()}
        </Typography>
      </Box>
      <Divider />
      <Box style={{ padding: "10px 0" }} background="neutral100">
        <Flex>
          <Flex style={{ flexGrow: "2" }}>
            <Button
              size="S"
              style={{ marginRight: "10px" }}
              variant="success"
              loading={isMigrating}
              onClick={() => {
                migrate(activeModel.model);
              }}
              disabled={!isMigrateActive}
            >
              migrate
            </Button>
            <Button
              size="S"
              style={{ marginRight: "10px" }}
              variant="secondary"
              loading={isCreating}
              onClick={() => {
                createIndex(activeModel.model);
              }}
              disabled={isCreated}
            >
              create
            </Button>
            <Button
              size="S"
              style={{ marginRight: "10px" }}
              variant="danger"
              loading={isDeleting}
              onClick={() => {
                deleteIndex(activeModel.model);
              }}
              disabled={isDeleted}
            >
              delete
            </Button>
          </Flex>
          <Box>
            <Flex style={{ alignItems: "center" }}>
              <Typography variant="omega" style={{ marginRight: "10px" }}>
                Entries per page:
              </Typography>
              <Select
                style={{
                  width: "fit-content",
                  height: "2.4rem",
                  fontSize: "1.0rem",
                }}
                name="params._limit"
                onChange={onChangeParams}
                options={LIMIT_OPTIONS}
                value={limit}
                className="col-2"
              />
            </Flex>
          </Box>
        </Flex>
      </Box>
      {!tableData.length && (
        <Box padding={8} style={{ background: "white" }}>
          <Typography variant="alfa">There is no data!</Typography>
        </Box>
      )}
      {loading ? (
        new Array(10).fill(0).map(() => (
          <>
            <LoadingBar />
            <div className="mt-3" />
          </>
        ))
      ) : (
        <>
          <Box style={{ padding: "10px 0" }} background="neutral100">
            <Table colCount={tableHeaders.length} rowCount={tableData.length}>
              <Thead>
                <Tr>
                  {tableHeaders.map((item) => (
                    <Th>
                      <Typography variant="sigma">{item.name}</Typography>
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {tableData.map((entry) => (
                  <Tr key={entry.id}>
                    {Object.keys(entry).map((item) => {
                      return (
                        <Td style={{ maxWidth: "20vw" }}>
                          <Typography textColor="neutral800" ellipsis>
                            {entry[item]}
                          </Typography>
                        </Td>
                      );
                    })}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          <Box>
            <GlobalPagination
              count={totalCount}
              onChangeParams={onChangeParams}
              params={{
                _limit: parseInt(limit || 10, 10),
                _page: page,
              }}
            />
          </Box>
        </>
      )}
    </Wrapper>
  );
};

DataView.propTypes = {
  data: PropTypes.array.isRequired,
  refreshData: PropTypes.func.isRequired,
  activeModel: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  page: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  limit: PropTypes.string.isRequired,
  onChangeParams: PropTypes.func.isRequired,
  isMigrateActive: PropTypes.bool.isRequired,
  isDeleted: PropTypes.bool.isRequired,
  isCreated: PropTypes.bool.isRequired,
};

export default memo(DataView);
