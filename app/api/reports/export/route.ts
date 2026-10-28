import { authorized, fail } from "@/lib/http";
import { fetchReport,groupReport,type Period } from "@/lib/reports";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import ExcelJS from "exceljs";
import { pdfResponse } from "@/lib/pdf";
export const runtime="nodejs";
export async function GET(req:Request) {
  const {error}=await authorized("reports.export"); if(error) return error;
  const params=new URL(req.url).searchParams;
  const format=params.get("format") || "xlsx";
  if(!["xlsx","pdf"].includes(format)) return fail("Unsupported export format");
  const rows=await fetchReport(params);
  const columns=["Registration No","First Name","Last Name","Email","Phone","Program","Status","Registration Date"];
  const data=rows.map(s=>[s.registrationNo,s.firstName,s.lastName,s.email||"",s.phone,s.program,s.status,s.registeredAt.toISOString().slice(0,10)]);
  if(format==="xlsx") {
    const workbook=new ExcelJS.Workbook();
    workbook.creator="Monoline";
    const worksheet=workbook.addWorksheet("Student Registrations",{views:[{state:"frozen",ySplit:1}]});
    worksheet.addRow(columns);
    worksheet.getRow(1).font={bold:true,color:{argb:"FFFFFFFF"}};
    worksheet.getRow(1).fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF25272B"}};
    data.forEach(row=>worksheet.addRow(row));
    worksheet.columns=[{width:25},{width:20},{width:20},{width:30},{width:19},{width:26},{width:15},{width:19}];
    worksheet.autoFilter={from:"A1",to:"H1"};
    const buffer=await workbook.xlsx.writeBuffer();
    const raw = Buffer.from(buffer);
    const body = new ArrayBuffer(raw.byteLength);
    new Uint8Array(body).set(raw);
    return new Response(body,{headers:{"Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","Content-Disposition":"attachment; filename=monoline-report.xlsx","Cache-Control":"no-store"}});
  }
  const pdf=await PDFDocument.create();
  const regular=await pdf.embedFont(StandardFonts.Helvetica);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  // Summary PDF includes complete filtered counts and first 200 student rows.
  const periodParam=params.get("period") || "monthly";
  const period:Period=["daily","monthly","quarterly","yearly"].includes(periodParam)?periodParam as Period:"monthly";
  const grouped=groupReport(rows,period);
  let page=pdf.addPage([842,595]), y=556;
  function safe(str:unknown){return String(str??"").replace(/[^\x20-\x7e\xa0-\xff]/g," ");}
  function line(text:string,size=10,header=false){
    if(y<45){page=pdf.addPage([842,595]);y=556;}
    page.drawText(safe(text).slice(0,124),{x:38,y,size,font:header?bold:regular,color:rgb(.15,.16,.19)});y-=header?27:18;
  }
  line("MONOLINE | STUDENT REGISTRATION REPORT",18,true);
  line(`Total matched: ${rows.length}    Generated: ${new Date().toISOString().slice(0,10)}   Period: ${period}`);
  y-=10;line("PERIOD SUMMARY",12,true);
  for(const g of grouped) line(`${g.label}: ${g.count} registrations`);
  y-=12;line("STUDENT RECORDS (first 200 of matching registrations)",12,true);
  for(const row of data.slice(0,200)) line(`${row[0]}  |  ${row[1]} ${row[2]}  |  ${row[5]}  |  ${row[6]}  |  ${row[7]}`,9);
  return pdfResponse(await pdf.save(),"monoline-report.pdf");
}
