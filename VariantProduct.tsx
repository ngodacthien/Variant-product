import { Button, Card, CardBody, CardFooter, Input } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import VariantList from "./VariantList";

export type VariantProductProps = {
  form: any;
  fieldName: string;
  isEdit?: boolean;
};

export type Option = {
  value: string;
};

export type Group = {
  name: string;
  options: Option[];
};

export default function VariantProduct({
  form,
  fieldName,
  isEdit,
}: VariantProductProps) {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const initialGroups = form.getValues(fieldName) || [];
    setGroups(
      initialGroups.map((group: Group) => ({
        name: group.name,
        options: group.options.map((option) => ({ value: option.value })),
      }))
    );
  }, [form, fieldName]);

  const handleAddGroup = () => {
    if (groups.length < 3) {
      setGroups([
        ...groups,
        {
          name: `Phân loại ${groups.length + 1}`,
          options: [{ value: "Option 1" }],
        },
      ]);
    }
  };

  const handleLabelChange = (index: number, value: string) => {
    const updatedGroups = [...groups];
    updatedGroups[index].name = value;
    setGroups(updatedGroups);
  };

  const handleOptionChange = (
    groupIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].options[optionIndex].value = value;
    setGroups(updatedGroups);
  };

  const handleAddOption = (groupIndex: number) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].options.push({
      value: `Option ${updatedGroups[groupIndex].options.length + 1}`,
    });
    setGroups(updatedGroups);
  };

  const handleDeleteGroup = (groupIndex: number) => {
    setGroups(groups.filter((_, index) => index !== groupIndex));
  };

  const handleDeleteOption = (groupIndex: number, optionIndex: number) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].options = updatedGroups[
      groupIndex
    ].options.filter((_, index) => index !== optionIndex);
    setGroups(updatedGroups);
  };

  useEffect(() => {
    form.setValue(
      fieldName,
      groups.map((group) => ({
        name: group.name,
        options: group.options.map((option) => option.value), // Only the string value
      }))
    );
  }, [groups, form, fieldName]);

  return (
    <div>
      <Card>
        <CardBody>
          <div className="flex gap-3 items-center mb-4">
            <span>Phân loại hàng</span>
          </div>

          {groups.map((group, groupIndex) => (
            <Card key={groupIndex} className="flex flex-col gap-3 mb-4">
              <CardBody className="flex flex-row items-center justify-between gap-3 border-b">
                <Input
                  className="w-[200px]"
                  size="sm"
                  placeholder={`Label ${group.name}`}
                  onChange={(e) =>
                    handleLabelChange(groupIndex, e.target.value)
                  }
                />
                <Trash2Icon
                  size={16}
                  className="cursor-pointer text-danger-500"
                  onClick={() => handleDeleteGroup(groupIndex)}
                />
              </CardBody>

              <div className="grid grid-cols-2 gap-4 p-3">
                {group.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center justify-between"
                  >
                    <Input
                      className="w-full"
                      size="sm"
                      placeholder={option.value}
                      onChange={(e) =>
                        handleOptionChange(
                          groupIndex,
                          optionIndex,
                          e.target.value
                        )
                      }
                    />
                    {optionIndex !== 0 && (
                      <Trash2Icon
                        size={16}
                        className="cursor-pointer text-danger-500 ml-2"
                        onClick={() =>
                          handleDeleteOption(groupIndex, optionIndex)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              {group.options.length < 10 && (
                <CardFooter>
                  <Button
                    fullWidth={false}
                    startContent={<PlusIcon size={16} />}
                    onPress={() => handleAddOption(groupIndex)}
                  >
                    Thêm option
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}

          {groups.length < 3 && (
            <Button
              fullWidth={false}
              startContent={<PlusIcon size={16} />}
              onPress={handleAddGroup}
            >
              Thêm nhóm phân loại {groups.length + 1}
            </Button>
          )}
        </CardBody>
      </Card>

      <VariantList groups={groups} fieldName="combinations" form={form} />
    </div>
  );
}
