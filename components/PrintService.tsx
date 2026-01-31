
import React from 'react';
import PrintProvider from '../print/PrintProvider';
import { PrintDocType } from '../print/print.types';
import { SchoolProfile, ExamSession, Student, ExamSchedule } from '../types';

interface PrintServiceProps {
  type: PrintDocType;
  school: SchoolProfile;
  session?: ExamSession;
  schedule?: ExamSchedule;
  students?: Student[];
  selectedRoomId?: string;
  onDone?: () => void;
}

const PrintService: React.FC<PrintServiceProps> = (props) => {
  return <PrintProvider {...props} />;
};

export default PrintService;
