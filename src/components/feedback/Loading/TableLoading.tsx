import { Skeleton } from '../Skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../ui/Table';

export interface TableLoadingProps {
  readonly rows?: number;
  readonly columns?: number;
  readonly headers?: readonly string[];
}

/**
 * Skeleton rows meant to be rendered inside an existing <TableBody>.
 */
export function TableLoadingRows({ rows = 5, columns = 4 }: { readonly rows?: number; readonly columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton
                height="16px"
                width={colIndex === 0 ? '70%' : colIndex === columns - 1 ? '40%' : '85%'}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/**
 * Complete standalone table loading skeleton.
 * Prevents layout shift while fetching tabular datasets like Employees, Attendance, or Payroll runs.
 */
export function TableLoading({ rows = 5, columns = 4, headers }: TableLoadingProps) {
  const colCount = headers ? headers.length : columns;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers
            ? headers.map((header, idx) => <TableHead key={idx}>{header}</TableHead>)
            : Array.from({ length: colCount }).map((_, idx) => (
                <TableHead key={idx}>
                  <Skeleton width="60px" height="14px" />
                </TableHead>
              ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableLoadingRows rows={rows} columns={colCount} />
      </TableBody>
    </Table>
  );
}
