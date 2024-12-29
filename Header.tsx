import { useEffect } from "react";
import {
  SearchFieldSpace,
  SearchLabel,
  SelectBox,
  TextField,
  Button,
  FromToDateTimePicker,
} from "@/components/common";
import styles from "./Header.module.css";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  managementAbnormalUserName,
  managementAbnormalBusiness,
  managementAbnormalDepartment,
  managementAbnormalData,
  managementAbnormalSelected,
  fromDateAtom,
  toDateAtom,
} from "@/store/atoms";
import { OptionType } from "@atlaskit/select";
import { apiRequest } from "@/lib/api";
import { AbnormalResponse, HistoryResponse } from "@/types/response";
import { formatDate } from "@/utils/date";
import { showToast } from "@/utils/toast";

const Header: React.FC = () => {
  const [business, setValue] = useAtom<OptionType>(managementAbnormalBusiness);
  const [department, setDepartment] = useAtom<string>(
    managementAbnormalDepartment
  );
  const [name, setName] = useAtom<string>(managementAbnormalUserName);
  const setData = useSetAtom(managementAbnormalData);
  const selectedData = useAtomValue(managementAbnormalSelected);
  const fromDate = useAtomValue(fromDateAtom);
  const todate = useAtomValue(toDateAtom);

  const getAccessManagementAbnormalData = async () => {
    try {
      if (business === undefined) return;
      const businessId = business.value;
      const params: any = {
        businessId: businessId,
        startDate: formatDate(fromDate),
        endDate: formatDate(todate),
      };
      if (department) {
        params.department = department;
      }
      if (name) {
        params.name = name;
      }

      const abnormalData = await apiRequest.get<AbnormalResponse>(
        ["accessManagement", "abnormal"],
        params
      );
      setData({ ...abnormalData.data });
    } catch (error) {
      console.log(error);
      showToast("데이터 로딩에 실패하였습니다", "error");
    }
  };
  useEffect(() => {
    getAccessManagementAbnormalData();
  }, [business]);

  const handleQueryButtonClick = () => {
    getAccessManagementAbnormalData();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleQueryButtonClick();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.queryContainer}>
        <SearchLabel required={true}>사업장</SearchLabel>
        <SearchFieldSpace type={"GROUP"} />
        <SelectBox value={business} setValue={setValue} />
        <SearchFieldSpace type={"OTHER"} />
        <SearchLabel required={true}>출입일</SearchLabel>
        <SearchFieldSpace type={"GROUP"} />
        <FromToDateTimePicker />
        <SearchFieldSpace type={"OTHER"} />
        <SearchLabel required={false}>이름</SearchLabel>
        <SearchFieldSpace type={"GROUP"} />
        <TextField
          value={name}
          onChange={setName}
          onKeyDown={handleKeyDown}
          placeholder="이름 입력"
        />
        <SearchFieldSpace type={"OTHER"} />
        <SearchLabel required={false}>소속</SearchLabel>
        <SearchFieldSpace type={"GROUP"} />
        <TextField
          value={department}
          onChange={setDepartment}
          onKeyDown={handleKeyDown}
          placeholder="소속 입력"
        />
        <SearchFieldSpace type={"OTHER"} />
        <Button title={"조회"} onClick={handleQueryButtonClick} type="blue" />
      </div>
      <div className={styles.line} />
    </div>
  );
};
export default Header;
