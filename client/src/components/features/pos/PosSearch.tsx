import { Input, Switch, Typography, Segmented } from "antd";
import { RefObject } from "react";
import type { InputRef } from "antd";
import {
  SearchOutlined,
  BarcodeOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";

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
    <div className="pos-search-container bg-white rounded-2xl shadow-sm border border-slate-100 p-3 md:p-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Search Input */}
        <div className="flex-1">
          <Search
            ref={searchInputRef}
            placeholder={
              searchType === "barcode"
                ? "Scan or enter barcode..."
                : "Search products by name..."
            }
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onSearch={(value) => onSearch(value)}
            size="large"
            prefix={
              searchType === "barcode" ? (
                <BarcodeOutlined className="text-slate-400" />
              ) : (
                <SearchOutlined className="text-slate-400" />
              )
            }
            allowClear
            className="pos-search-input"
            enterButton={<span className="hidden sm:inline">Search</span>}
          />
        </div>

        {/* Search Type Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Text className="text-slate-500 text-sm hidden md:block">
            Search by:
          </Text>
          <Segmented
            value={searchType}
            onChange={(value) =>
              onSearchTypeChange(value as "name" | "barcode")
            }
            options={[
              {
                value: "name",
                icon: <FontSizeOutlined />,
                label: <span className="hidden sm:inline ml-1">Name</span>,
              },
              {
                value: "barcode",
                icon: <BarcodeOutlined />,
                label: <span className="hidden sm:inline ml-1">Barcode</span>,
              },
            ]}
            className="pos-search-toggle"
          />
        </div>
      </div>
    </div>
  );
};

export default PosSearch;
