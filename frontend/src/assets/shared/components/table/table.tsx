import { useState } from "react";
import {
  ChevronRight,
  ChevronsRight,
  ChevronLeft,
  ChevronsLeft,
  Plus,
  Pencil,
  Trash2,
  MoveDown,
  MoveUp,
} from "lucide-react";

import Text from "../text/text";
import Button from "../button/button";
import Input from "../input/input";
import { date } from "../../utils/date";

import "./style.scss";
import type { RenderType } from "../../types/types";

export interface TableColumn<T> {
  field: keyof T;
  title: string;
  render?: RenderType;
}

export interface TableRowStyle<T> {
  attrValidate: keyof T;
  validator: unknown;
  class: string;
}

interface TableProps<T extends Record<string, unknown>> {
  title?: string;
  columns: TableColumn<T>[];
  data: T[];
  searchBar?: boolean;

  createRowFunction?: ((value: string) => void) | null;
  editRowFunction?: ((row: T) => void) | null;
  deleteRowFunction?: ((id: T[keyof T]) => void) | null;

  toolbarExtraFunc?: React.ReactNode;
  rowExtraFunc?: ((id: T[keyof T]) => React.ReactNode) | null;

  showPaginator?: boolean;
  rowStyle?: TableRowStyle<T> | null;
}

function Table<T extends Record<string, unknown>>({
  title = "",
  columns,
  data,
  searchBar = true,
  createRowFunction = null,
  editRowFunction = null,
  deleteRowFunction = null,
  toolbarExtraFunc = null,
  rowExtraFunc = null,
  showPaginator = true,
  rowStyle = null,
}: TableProps<T>) {
  const [columnToOrder, setColumnToOrder] = useState<keyof T | "">("");
  const [typeToSort, setTypeToSort] = useState<"fordward" | "reverse">(
    "fordward"
  );

  const [filteOnTable, setFilterOnTable] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filteredData =
    filteOnTable.trim() === ""
      ? data
      : data.filter((row) => {
          const term = filteOnTable.toLowerCase();

          const values = Array.isArray(row)
            ? row
            : Object.values(row ?? {});

          return values.some((value) =>
            value?.toString().toLowerCase().includes(term)
          );
        });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const effectivePage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  if (!data || !Array.isArray(data)) {
    return <div>No hay datos disponibles.</div>;
  }

  const orderData =
    columnToOrder !== ""
      ? [...filteredData].sort((a, b) => {
          const valueA = a[columnToOrder];
          const valueB = b[columnToOrder];

          let result: number;

          if (
            typeof valueA === "number" &&
            typeof valueB === "number"
          ) {
            result = valueA - valueB;
          } else {
            result = String(valueA ?? "").localeCompare(
              String(valueB ?? ""),
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              }
            );
          }

          return typeToSort === "fordward" ? result : -result;
        })
      : filteredData;

  const paginatedData = orderData.slice(
    (effectivePage - 1) * pageSize,
    effectivePage * pageSize
  );

  const showActions =
    !!editRowFunction || !!deleteRowFunction || !!rowExtraFunc;

  const handlerRenderCellValue = (
    column: TableColumn<T>,
    row: T
  ): React.ReactNode => {
    const cellValue = row?.[column.field];

    switch (column.render) {
      case "bool":
        return cellValue ? "Yes" : "No";

      case "hour":
        return date.time(cellValue as Date | string | number);

      default:
        return cellValue as React.ReactNode;
    }
  };

  const handlerOrderByTHead = (column: TableColumn<T>) => {
    const { field } = column;

    setTypeToSort((previous) =>
      previous === "fordward" ? "reverse" : "fordward"
    );

    setColumnToOrder(field);
  };

  const handlerRenderTRHead = (
    columnsData: TableColumn<T>[]
  ): React.ReactNode => {
    if (!columnsData || columnsData.length === 0) {
      return (
        <tr>
          <th colSpan={100}>
            <Text type="text" text="Sin columnas" />
          </th>
        </tr>
      );
    }

    return (
      <tr>
        {showActions && <th></th>}

        {columnsData.map((col) => (
          <th
            className={`t-head-column ${
              columnToOrder === col.field ? "active-sort" : ""
            }`}
            onClick={() => handlerOrderByTHead(col)}
            key={String(col.field)}
          >
            <Text type="text" text={col.title} />

            {columnToOrder === col.field &&
              (typeToSort === "fordward" ? (
                <MoveDown size={16} />
              ) : (
                <MoveUp size={16} />
              ))}
          </th>
        ))}
      </tr>
    );
  };

  const handlerRenderTRBody = (
    infoRows: T[]
  ): React.ReactNode => {
    if (!infoRows || infoRows.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length + (showActions ? 1 : 0)}>
            <Text type="text" text="No hay datos disponibles." />
          </td>
        </tr>
      );
    }

    return infoRows.map((row, index) => (
      <tr
        key={String(row.id ?? index)}
        className={
          rowStyle &&
          row[rowStyle.attrValidate] === rowStyle.validator
            ? rowStyle.class
            : ""
        }
      >
        {showActions && (
          <td className="row-actions">
            {editRowFunction && (
              <Button
                customClass="primary"
                icon={<Pencil />}
                onClick={() => editRowFunction(row)}
              />
            )}

            {deleteRowFunction && (
              <Button
                customClass="danger"
                icon={<Trash2 />}
                onClick={() =>
                  deleteRowFunction(row.id as T[keyof T])
                }
              />
            )}

            {rowExtraFunc && rowExtraFunc(row.id as T[keyof T])}
          </td>
        )}

        {columns.map((column) => (
          <td
            key={`${String(column.field)}-${String(row.id ?? index)}`}
          >
            <Text type="text" text={handlerRenderCellValue(column, row)} />
          </td>
        ))}
      </tr>
    ));
  };

  const renderPagination = () => (
    <div className="pagination-controls">
      <div>
        <Text type="text" text="Mostrar" />

        <Input
          typeInput="select"
          options={[
            { value: 10, label: "10" },
            { value: 25, label: "25" },
            { value: 50, label: "50" },
            { value: 100, label: "100" },
          ]}
          val={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
        />

        <Text type="text" text=" registros por página" />
      </div>

      <div>
        <Button
          icon={<ChevronsLeft />}
          onClick={() => setCurrentPage(1)}
          disabled={effectivePage === 1}
        />

        <Button
          icon={<ChevronLeft />}
          onClick={() =>
            setCurrentPage(Math.max(effectivePage - 1, 1))
          }
          disabled={effectivePage === 1}
        />

        <Text
          type="text"
          text={`Página ${effectivePage} de ${totalPages}`}
        />

        <Button
          icon={<ChevronRight />}
          onClick={() =>
            setCurrentPage(Math.min(effectivePage + 1, totalPages))
          }
          disabled={effectivePage === totalPages || totalPages === 0}
        />

        <Button
          icon={<ChevronsRight />}
          onClick={() => setCurrentPage(totalPages)}
          disabled={effectivePage === totalPages || totalPages === 0}
        />
      </div>
    </div>
  );

  return (
    <div className="container-data-table">
      <div className="header-data-table">
        {title && <Text type="title" text={title} />}

        <div className="controls-bar">
          {searchBar && (
            <Input
              text="Buscar"
              typeInput="text"
              onChange={(e) => {
                setFilterOnTable(e.target.value);
                setCurrentPage(1);
              }}
              val={filteOnTable}
              mustBeValidate={false}
              asSearch={true}
            />
          )}

          {toolbarExtraFunc}

          {createRowFunction && (
            <Button
                customClass="success"
                icon={<Plus />}
                onClick={() => createRowFunction("")}
            />
          )}
        </div>
      </div>

      <table className="data-table">
        <thead>
          {handlerRenderTRHead(columns)}
        </thead>

        <tbody>
          {handlerRenderTRBody(paginatedData)}
        </tbody>

        {showPaginator && (
          <tfoot>
            <tr>
              <td
                colSpan={
                  columns.length + (showActions ? 1 : 0)
                }
              >
                <Text text={`Total: ${filteredData.length} de ${data.length} registros`} type="small" />
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {showPaginator && renderPagination()}
    </div>
  );
}

export default Table;