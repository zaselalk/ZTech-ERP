import { Input, Switch, Typography } from "antd";
import { RefObject } from "react";
import type { InputRef } from "antd";

const { Search } = Input;
const { Text } = Typography;

interface PosSearchProps {
  searchQuery: string;
  searchType: "name" | "barcode";
  onSearchQueryChange: (query: string) => void;
  onSearchTypeChange: (type: "name" | "barcode") => void;
  onSearch: (value: string) => void;
  searchInputRef: RefObject<InputRef | null>;
}

const PosSearch = ({
  searchQuery,
  searchType,
  onSearchQueryChange,
  onSearchTypeChange,
  onSearch,
  searchInputRef,
}: PosSearchProps) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 24,
        gap: 16,
      }}
    >
      <Search
        ref={searchInputRef}
        placeholder={`Search for books by ${searchType}...`}
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        onSearch={(value) => onSearch(value)}
        style={{ flex: 1 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Text>Search by:</Text>
        <Switch
          checkedChildren="Barcode"
          unCheckedChildren="Name"
          checked={searchType === "barcode"}
          onChange={(checked) =>
            onSearchTypeChange(checked ? "barcode" : "name")
          }
        />
      </div>
    </div>
  );
};

export default PosSearch;
