import { StyleSheet } from "@react-pdf/renderer";
import { MARGIN, SURAT_TYPOGRAPHY, KOP_CONFIG, SIGNATURE_CONFIG } from "@/constants";

/**
 * PDF Styles — Standar ANRI No. 5/2021
 * Digunakan oleh @react-pdf/renderer
 */
export const pdfStyles = StyleSheet.create({
  // Page
  page: {
    paddingTop: `${MARGIN.top}mm`,
    paddingRight: `${MARGIN.right}mm`,
    paddingBottom: `${MARGIN.bottom}mm`,
    paddingLeft: `${MARGIN.left}mm`,
    fontFamily: "Times-Roman",
    fontSize: 12,
    lineHeight: SURAT_TYPOGRAPHY.lineHeight,
    color: "#000",
  },

  // === KOP SURAT ===
  kopContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  kopContainerCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  kopLogo: {
    width: `${KOP_CONFIG.logoSize}mm`,
    height: `${KOP_CONFIG.logoSize}mm`,
    objectFit: "contain",
  },
  kopTextCenter: {
    flex: 1,
    textAlign: "center",
  },
  kopTextLeft: {
    flex: 1,
  },
  kopNamaLembaga: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  kopAlamat: {
    fontSize: 10,
    marginTop: 2,
  },
  kopKontak: {
    fontSize: 10,
    marginTop: 1,
  },
  kopDivider: {
    borderBottomWidth: `${KOP_CONFIG.dividerWeight}pt`,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    marginTop: "3mm",
    marginBottom: `${KOP_CONFIG.gapBelowDivider}mm`,
  },

  // === SURAT META ===
  metaContainer: {
    marginTop: "5mm",
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 1,
  },
  metaLabel: {
    width: 65,
  },
  metaColon: {
    width: 10,
  },
  metaValue: {
    flex: 1,
  },
  metaValueUnderline: {
    flex: 1,
    textDecoration: "underline",
  },

  // === TUJUAN BLOCK ===
  tujuanContainer: {
    marginTop: "5mm",
  },
  tujuanDi: {
    flexDirection: "row",
  },
  tujuanDiLabel: {
    width: 20,
  },

  // === BODY ===
  bodyContainer: {
    marginTop: "5mm",
    textAlign: "justify",
  },
  bodyParagraph: {
    textIndent: 35, // ~1.25cm in pt
    marginTop: "3mm",
  },
  bodyContent: {
    marginTop: "3mm",
    textIndent: 35,
  },

  // === FIELD GROUP (for template body_parts) ===
  fieldGroupContainer: {
    marginTop: "3mm",
    marginBottom: "3mm",
    paddingLeft: 35, // match indent
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  fieldLabel: {
    width: 120,
  },
  fieldColon: {
    width: 10,
  },
  fieldValue: {
    flex: 1,
  },

  // === SIGNATURE ===
  signatureContainer: {
    marginTop: "10mm",
    width: SIGNATURE_CONFIG.width,
    marginLeft: "auto",
  },
  signatureText: {
    textAlign: "center",
  },
  signatureJabatan: {
    textAlign: "center",
    marginTop: 2,
  },
  signatureSpace: {
    height: `${SIGNATURE_CONFIG.signatureSpace}px`,
  },
  signatureImage: {
    height: `${SIGNATURE_CONFIG.signatureSpace}px`,
    objectFit: "contain",
    marginVertical: 4,
  },
  signatureNama: {
    textAlign: "center",
    fontFamily: "Times-Bold",
    textDecoration: "underline",
  },
  signatureNip: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 2,
  },

  // === TEMBUSAN ===
  tembusanContainer: {
    marginTop: "10mm",
  },
  tembusanTitle: {
    fontFamily: "Times-Bold",
  },
  tembusanItem: {
    marginTop: 2,
    marginLeft: 10,
  },
});
