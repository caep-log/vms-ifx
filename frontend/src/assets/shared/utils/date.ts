type DateInput = Date | string | number;

const pad = (value: number, size = 2): string =>
  String(value).padStart(size, "0");

const create = (date: DateInput = new Date()): Date =>
  date instanceof Date ? new Date(date) : new Date(date);

export const date = {
  now(): Date {
    return create();
  },

  parse(value: DateInput): Date {
    return create(value);
  },

  iso(value: DateInput = new Date()): string {
    return create(value).toISOString().replace(/Z$/, "");
  },

  date(value: DateInput): string {
    const d = create(value);

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },

  month(value: DateInput): string {
    const d = create(value);

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  },

  time(value: DateInput): string {
    const d = create(value);

    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  },

  dateTime(value: DateInput): string {
    const d = create(value);

    return `${this.date(d)}T${this.time(d)}.${pad(d.getMilliseconds(), 3)}`;
  },

  startOfDay(value: DateInput): Date {
    const d = create(value);

    d.setHours(0, 0, 0, 0);

    return d;
  },

  endOfDay(value: DateInput): Date {
    const d = create(value);

    d.setHours(23, 59, 59, 999);

    return d;
  },

  startOfMonth(value: DateInput): Date {
    const d = create(value);

    return new Date(
      d.getFullYear(),
      d.getMonth(),
      1,
      0,
      0,
      0,
      0
    );
  },

  endOfMonth(value: DateInput): Date {
    const d = create(value);

    return new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
  },

  isMonth(value: string): boolean {
    return /^\d{4}-\d{2}$/.test(value);
  },

  isDay(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }
};