import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Group } from "./VariantProduct";
import {
  Card,
  CardBody,
  Divider,
  Input,
  Button,
  CardHeader,
} from "@nextui-org/react";
import { TrashIcon } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { debounce, isEqual } from "lodash";

type Option = {
  value: string;
};

type TransformedData = {
  variant1: Option;
  variant2?: Option;
  variant3?: Option;
  price?: any;
  quantity?: any;
};

type VariantListProps = {
  groups: Group[];
  form: any;
  fieldName: string;
};

export default function VariantList({
  groups,
  form,
  fieldName,
}: VariantListProps) {
  const [transformedData, setTransformedData] = useState<TransformedData[]>([]);
  const [tempPrice, setTempPrice] = useState<string>("");
  const [tempQuantity, setTempQuantity] = useState<string>("");
  const [combinationsData, setCombinationsData] = useState<any[]>([]);

  const transformDataByIndex = useCallback(
    (groups: Group[]): TransformedData[] => {
      if (!groups || groups.length === 0) return [];

      const variant1 = groups[0]?.options || [];
      const variant2 = groups[1]?.options || [];
      const variant3 = groups[2]?.options || [];

      const data: TransformedData[] = [];

      variant1.forEach((v1) => {
        if (variant2.length > 0) {
          variant2.forEach((v2) => {
            if (variant3.length > 0) {
              variant3.forEach((v3) =>
                data.push({ variant1: v1, variant2: v2, variant3: v3 })
              );
            } else {
              data.push({ variant1: v1, variant2: v2 });
            }
          });
        } else if (variant3.length > 0) {
          variant3.forEach((v3) => data.push({ variant1: v1, variant3: v3 }));
        } else {
          data.push({ variant1: v1 });
        }
      });

      return data;
    },
    []
  );

  const handleDelete = useCallback(
    (index: number) => {
      setTransformedData((prev) => {
        const updatedData = prev.filter((_, i) => i !== index);

        // Cập nhật form value sau khi xoá trong useEffect
        setTimeout(() => {
          const formValues = form.getValues(fieldName) || [];
          const updatedFormValues = formValues.filter(
            (_: any, i: number) => i !== index
          );

          form.setValue(fieldName, updatedFormValues, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }, 0);

        return updatedData;
      });
    },
    [form, fieldName]
  );

  const handleGlobalInputChange = useCallback(
    (setState: React.Dispatch<React.SetStateAction<string>>, value: string) => {
      setState(value);
    },
    []
  );

  const handleSubmitGlobal = useCallback(() => {
    setTransformedData((prev) =>
      prev.map((item) => ({
        ...item,
        price: tempPrice,
        quantity: tempQuantity,
      }))
    );

    const updatedFormValues = transformedData.map((item) => ({
      variant1: item.variant1.value,
      variant2: item.variant2?.value,
      variant3: item.variant3?.value,
      price: tempPrice,
      quantity: tempQuantity,
    }));

    form.setValue(fieldName, updatedFormValues);
  }, [tempPrice, tempQuantity, transformedData, form, fieldName]);

  const handleInputChange = useCallback(
    (index: number, field: "price" | "quantity", value: string) => {
      // Prevent re-renders by avoiding updates if the value hasn't changed
      const parsedValue =
        field === "price" ? parseFloat(value) : parseInt(value, 10);
      if (
        isNaN(parsedValue) ||
        transformedData[index]?.[field] === parsedValue
      ) {
        return;
      }

      // Update local state
      setTransformedData((prev) =>
        prev.map((data, idx) =>
          idx === index ? { ...data, [field]: parsedValue } : data
        )
      );

      // Update form values
      const formValues = form.getValues(fieldName) || [];
      const updatedFormValues = formValues.map((formItem: any, idx: number) =>
        idx === index
          ? {
              ...formItem,
              [field]: parsedValue,
              variant1: transformedData[idx].variant1?.value,
              variant2: transformedData[idx].variant2?.value,
              variant3: transformedData[idx].variant3?.value,
            }
          : formItem
      );

      form.setValue(fieldName, updatedFormValues, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [transformedData, form, fieldName]
  );

  const debouncedHandleInputChange = useMemo(
    () =>
      debounce((index: number, field: "price" | "quantity", value: string) => {
        handleInputChange(index, field, value);
      }, 300),
    [handleInputChange]
  );

  const memoizedGroups = useMemo(() => groups, [groups]);

  useEffect(() => {
    const transformed = transformDataByIndex(memoizedGroups);
    const formValues = form.getValues(fieldName) || [];

    const updatedTransformed = transformed.map((item, index) => {
      const formValue = formValues[index] || {};
      const combination = combinationsData[index] || {};

      // Ensure we handle 0 values correctly without triggering unnecessary updates
      return {
        ...item,
        price: formValue.price ?? combination.price ?? 0,
        quantity: formValue.quantity ?? combination.quantity ?? 0,
      };
    });

    // Only update transformedData if something has changed
    if (!isEqual(updatedTransformed, transformedData)) {
      setTransformedData(updatedTransformed);
    }
    // Only memoizedGroups and combinationsData should trigger this effect
  }, [memoizedGroups, combinationsData]);

  useEffect(() => {
    const formValues = form.getValues(fieldName) || [];

    const combinations = transformedData.map((item, index) => {
      const formValue = formValues[index] || {};

      return {
        variant1: item.variant1.value || "",
        variant2: item.variant2?.value || "",
        variant3: item.variant3?.value || "",
        price: formValue.price ?? item.price ?? 0, // Ensure price is handled correctly
        quantity: formValue.quantity ?? item.quantity ?? 0, // Ensure quantity is handled correctly
      };
    });

    // Prevent continuous re-renders by checking data equality
    if (!isEqual(combinations, combinationsData)) {
      setCombinationsData(combinations);
    }
    // Watch transformedData to trigger this effect
  }, [transformedData]);
  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={() => (
        <FormItem>
          <FormLabel>Thông tin bán hàng</FormLabel>
          <FormControl>
            <Card>
              <CardHeader></CardHeader>
              <CardBody>
                <div className="mb-4">
                  {groups.length > 0 && (
                    <div className="grid grid-cols-6 items-center p-2 bg-default-100 text-sm">
                      <div>{groups[0]?.name}</div>
                      <div>{groups[1]?.name}</div>
                      <div>{groups[2]?.name}</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mb-4">
                  <Input
                    labelPlacement="inside"
                    className="w-[120px]"
                    placeholder="Nhập giá chung"
                    value={tempPrice}
                    onChange={(e) =>
                      handleGlobalInputChange(setTempPrice, e.target.value)
                    }
                  />
                  <Input
                    labelPlacement="inside"
                    className="w-[120px]"
                    placeholder="Nhập số lượng chung"
                    value={tempQuantity}
                    onChange={(e) =>
                      handleGlobalInputChange(setTempQuantity, e.target.value)
                    }
                  />
                  <Button onClick={handleSubmitGlobal}>Submit</Button>
                </div>

                {transformedData.map((item, index) => (
                  <div key={index}>
                    <div className="grid grid-cols-6 items-center pt-2 text-sm p-1 gap-2">
                      <div>{item.variant1.value}</div>
                      <div>{item.variant2?.value || ""}</div>
                      <div>{item.variant3?.value || ""}</div>

                      <Input
                        labelPlacement="inside"
                        className="w-[80px]"
                        placeholder={item.price ? `${item.price}` : "Giá"}
                        value={item.price || 0}
                        onChange={(e) =>
                          debouncedHandleInputChange(
                            index,
                            "price",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        labelPlacement="inside"
                        className="w-[80px] ml-3"
                        placeholder={
                          item.quantity ? `${item.quantity}` : "Số lượng"
                        }
                        value={item.quantity || 0}
                        onChange={(e) =>
                          debouncedHandleInputChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                      />

                      <div className="flex justify-end">
                        <TrashIcon
                          onClick={() => handleDelete(index)}
                          size={14}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                    <Divider className="my-1" />
                  </div>
                ))}
              </CardBody>
            </Card>
          </FormControl>
          <FormDescription></FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
