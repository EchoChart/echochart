import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const defaultFormats = [
   'll',
   'lll',
   'LL',
   'LLL',
   'LLLL',
   'D MMM',
   'D MMMM',
   'MMM D',
   'MMMM D',
   'MMM',
   'MMMM',
   'YYYY-MM-DD',
   'YYYY-MM-DD HH:mm:ss',
   'YYYY-MM-DDTHH:mm:ss.SSS',
   'YYYY-MM-DDTHH:mm:ss.SSSZ',
   'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
   'YYYY-MM-DDTHH:mm:ss.SSSZ[Z]'
];

interface DateConfig {
   value: any;
   lang?: string;
   formats?: string | string[];
   returnFormat?: string;
   validate?: boolean;
}

export const isValidDate = ({
   value,
   lang = locale.value,
   formats = defaultFormats
}: DateConfig): boolean => {
   dayjs.locale(lang);
   return dayjs(value?.replace?.(/(\.\d{3})\d+/, '$1'), formats, lang, true)?.isValid();
};

export const parseDayjs = ({
   value,
   lang = locale.value,
   formats = defaultFormats,
   validate = true
}: DateConfig): Dayjs | any => {
   if (validate && !isValidDate({ value, lang, formats })) return value;

   if (_isString(value) && _endsWith(value, 'Z')) {
      return dayjs.utc(value).local(); // Treat as UTC, convert to local
   }

   return dayjs(value, formats, lang, false); // Treat as local
};

export const localeDateString = ({
   value,
   lang = locale.value,
   formats = defaultFormats,
   returnFormat = '',
   validate = true
}: DateConfig): string | any => {
   const date = parseDayjs({ value, lang, formats, validate });

   if (date === value) return value;

   const format =
      returnFormat ||
      (date.hour() !== 0 || date.minute() !== 0 || date.second() !== 0 ? 'lll' : 'll');
   return date.format(format);
};
