import { jsPDF } from 'jspdf'

export function generateDiploma({ courseTitle, firstName, lastName, finishedAt, lang = 'fr' }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const W = 297
  const H = 210

  // Background cream
  doc.setFillColor(255, 243, 224) // #FFF3E0 - lighter cream
  doc.rect(0, 0, W, H, 'F')

  // Top orange band
  doc.setFillColor(228, 77, 38) // #E44D26
  doc.rect(0, 0, W, 18, 'F')

  // Bottom orange band
  doc.rect(0, H - 14, W, 14, 'F')

  // Left accent bar
  doc.setFillColor(228, 77, 38)
  doc.rect(0, 18, 6, H - 32, 'F')

  // Right accent bar
  doc.rect(W - 6, 18, 6, H - 32, 'F')

  // Inner white card area
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(20, 26, W - 40, H - 46, 4, 4, 'F')

  // Subtle border on inner card
  doc.setDrawColor(232, 228, 220) // brand-border
  doc.setLineWidth(0.4)
  doc.roundedRect(20, 26, W - 40, H - 46, 4, 4, 'S')

  // Title
  const title = lang === 'fr' ? 'Certificat de réussite' : 'Certificate of Completion'
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(228, 77, 38)
  doc.text(title, W / 2, 52, { align: 'center' })

  // Decorative line under title
  doc.setDrawColor(228, 77, 38)
  doc.setLineWidth(0.8)
  doc.line(W / 2 - 60, 56, W / 2 + 60, 56)

  // "This certifies that" label
  const certLabel = lang === 'fr' ? 'Ce certificat atteste que' : 'This is to certify that'
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(107, 107, 107) // muted
  doc.text(certLabel, W / 2, 70, { align: 'center' })

  // Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(26, 26, 26) // dark
  doc.text(`${firstName} ${lastName}`, W / 2, 84, { align: 'center' })

  // "has completed" label
  const completedLabel = lang === 'fr' ? 'a complété avec succès la formation' : 'has successfully completed the training'
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(107, 107, 107)
  doc.text(completedLabel, W / 2, 95, { align: 'center' })

  // Course title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(26, 26, 26)
  // Word wrap if long title
  const titleLines = doc.splitTextToSize(`« ${courseTitle} »`, W - 80)
  doc.text(titleLines, W / 2, 108, { align: 'center' })

  const yAfterTitle = 108 + (titleLines.length - 1) * 8

  // Date
  const date = new Date(finishedAt)
  const dateStr = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const completedOn = lang === 'fr' ? `Complété le ${dateStr}` : `Completed on ${dateStr}`
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(107, 107, 107)
  doc.text(completedOn, W / 2, yAfterTitle + 14, { align: 'center' })

  // Issued by
  const issuedBy = lang === 'fr' ? 'Délivré par Super-Novae' : 'Issued by Super-Novae'
  doc.setFontSize(9)
  doc.setTextColor(160, 160, 160)
  doc.text(issuedBy, W / 2, H - 20, { align: 'center' })

  // Footer text in bands
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.text('SUPER-NOVAE', 20, 12)
  doc.text('SUPER-NOVAE', 20, H - 7)

  const fileName = `diplome-${courseTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
  doc.save(fileName)
}
