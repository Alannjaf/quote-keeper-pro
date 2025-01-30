import { DateSelect } from "../DateSelect";

interface DateSectionProps {
  date: Date;
  setDate: (date: Date) => void;
  validityDate: Date;
  setValidityDate: (date: Date) => void;
}

export function DateSection({
  date,
  setDate,
  validityDate,
  setValidityDate,
}: DateSectionProps) {
  return (
    <>
      <DateSelect
        label="Date"
        date={date}
        onSelect={(date) => date && setDate(date)}
      />

      <DateSelect
        label="Validity Date"
        date={validityDate}
        onSelect={(date) => date && setValidityDate(date)}
      />
    </>
  );
}