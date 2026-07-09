import { jsPDF } from 'jspdf';

export function exportBulletinPDF(
  studentName: string,
  studentId: string,
  filiere: string,
  semester: number,
  grades: { 
    subject: string; 
    classNote?: number; 
    examNote?: number; 
    value: number; 
    coefficient: number; 
    teacher?: string; 
  }[]
) {
  const doc = new jsPDF();
  
  // Header / Banner
  doc.setFillColor(99, 102, 241); // Indigo color
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CAMPUS ACADEMY', 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'normal');
  doc.text('BULLETIN ACADÉMIQUE', 140, 25);
  
  // Info section
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Informations Étudiant', 20, 60);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nom : ${studentName}`, 20, 70);
  doc.text(`Matricule : ${studentId}`, 20, 78);
  doc.text(`Filière : ${filiere}`, 120, 70);
  doc.text(`Semestre : Semestre ${semester}`, 120, 78);
  
  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 88, 195, 88);
  
  // Table header
  doc.setFont('Helvetica', 'bold');
  doc.text('Matière', 15, 98);
  doc.text('Coeff.', 75, 98);
  doc.text('Note Classe', 95, 98);
  doc.text('Note Examen', 125, 98);
  doc.text('Moyenne', 150, 98);
  doc.text('Appréciation', 172, 98);
  
  doc.line(15, 103, 195, 103);
  
  // Table rows
  doc.setFont('Helvetica', 'normal');
  let y = 112;
  let totalPoints = 0;
  let totalCoefficients = 0;
  
  grades.forEach((g) => {
    const subjName = g.subject.length > 28 ? g.subject.substring(0, 26) + '..' : g.subject;
    doc.text(subjName, 15, y);
    doc.text(String(g.coefficient), 75, y);
    
    const clText = g.classNote !== undefined && g.classNote !== null ? `${g.classNote.toFixed(1)}/20` : '—';
    const exText = g.examNote !== undefined && g.examNote !== null ? `${g.examNote.toFixed(1)}/20` : '—';
    doc.text(clText, 95, y);
    doc.text(exText, 125, y);
    const valText = g.value !== undefined && g.value !== null && !isNaN(g.value) ? `${g.value.toFixed(2)}/20` : '—';
    doc.text(valText, 150, y);
    
    // appreciation
    let appraisal = '—';
    if (g.classNote !== undefined && g.classNote !== null || g.examNote !== undefined && g.examNote !== null || (g.value !== undefined && g.value !== null && !isNaN(g.value))) {
      const val = g.value ?? 10;
      appraisal = 'Passable';
      if (val >= 16) appraisal = 'Très Bien';
      else if (val >= 14) appraisal = 'Bien';
      else if (val >= 12) appraisal = 'Assez Bien';
      else if (val < 10) appraisal = 'Insuffisant';
    }
    doc.text(appraisal, 172, y);
    
    totalPoints += g.value * g.coefficient;
    totalCoefficients += g.coefficient;
    y += 10;
  });
  
  doc.line(15, y - 5, 195, y - 5);
  
  // Calculate average
  const average = totalCoefficients > 0 ? (totalPoints / totalCoefficients) : 0;
  
  // Summary
  doc.setFont('Helvetica', 'bold');
  doc.text('Moyenne Générale :', 110, y + 5);
  doc.text(`${average.toFixed(2)}/20`, 150, y + 5);
  
  let resultText = 'Admis(e)';
  if (average < 10) resultText = 'Ajourné(e)';
  doc.text('Résultat :', 110, y + 15);
  doc.text(resultText, 150, y + 15);
  
  // Footer
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Généré automatiquement par le portail CAMPUS le ${new Date().toLocaleDateString('fr-FR')}`, 15, 280);
  
  doc.save(`bulletin_${studentName.replace(/\s+/g, '_')}_S${semester}.pdf`);
}

export function exportReceiptPDF(
  studentName: string,
  transactionId: string,
  amount: number,
  date: string,
  type: string,
  remaining: number
) {
  const doc = new jsPDF();
  
  // Header / Banner
  doc.setFillColor(79, 70, 229); // Purple color
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CAMPUS PAY', 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'normal');
  doc.text('REÇU DE TRANSACTION', 140, 25);
  
  // Info section
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Détails de la Transaction', 20, 60);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Étudiant : ${studentName}`, 20, 70);
  doc.text(`ID Transaction : ${transactionId}`, 20, 78);
  doc.text(`Date : ${new Date(date).toLocaleDateString('fr-FR')}`, 120, 70);
  doc.text(`Type : ${type}`, 120, 78);
  
  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 88, 190, 88);
  
  // Receipt body
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Désignation', 20, 100);
  doc.text('Montant', 150, 100);
  
  doc.line(20, 105, 190, 105);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Frais de Scolarité Universitaire', 20, 115);
  doc.text(`${amount.toLocaleString('fr-FR')} FCFA`, 150, 115);
  
  doc.line(20, 122, 190, 122);
  
  // Summary
  doc.setFont('Helvetica', 'bold');
  doc.text('Total payé :', 100, 135);
  doc.text(`${amount.toLocaleString('fr-FR')} FCFA`, 150, 135);
  
  doc.text('Reste à payer :', 100, 145);
  doc.text(`${remaining.toLocaleString('fr-FR')} FCFA`, 150, 145);
  
  // Signature block
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text("Cachet de l'établissement", 130, 180);
  
  // Decorative stamp circle
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.circle(150, 205, 15, 'S');
  doc.setFontSize(6);
  doc.setTextColor(79, 70, 229);
  doc.text('CAMPUS ACADEMY', 139, 204);
  doc.text('PAYÉ', 147, 208);
  
  // Footer
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Ce reçu est une pièce justificative officielle émise par CAMPUS le ${new Date().toLocaleDateString('fr-FR')}`, 20, 280);
  
  doc.save(`recu_${transactionId}.pdf`);
}
