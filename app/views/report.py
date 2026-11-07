"""HU-16: generación del reporte PDF de una evaluación (ReportLab).

El formato sigue el reporte del manual de usuario: título, datos del paciente, secciones
(datos personales, hábitos alimenticios, hábitos de consumo, presión arterial) y
recomendaciones personalizadas.
"""
from __future__ import annotations

from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

SI_NO = {True: "Sí", False: "No"}
AGUA = {"menos_de_1_litro": "menos de 1 litro", "de_1_a_2_litros": "de 1 a 2 litros",
        "mas_de_2_litros": "más de 2 litros"}
COLOR_NIVEL = {"verde": "#2f7d32", "amarillo": "#a37a00", "rojo": "#c62828"}


def _t(texto) -> str:
    return escape(str(texto))


def generar_pdf(nombre_usuario: str, resultado: dict, datos: dict) -> bytes:
    """Devuelve los bytes de un PDF con los datos, el nivel de riesgo y las recomendaciones."""
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=2.2 * cm, rightMargin=2.2 * cm,
                            topMargin=1.8 * cm, bottomMargin=1.8 * cm,
                            title="Reporte de Riesgo Cardiovascular", author="CardioPrev")
    base = getSampleStyleSheet()
    normal = ParagraphStyle("n", parent=base["Normal"], fontSize=10, leading=14)
    titulo = ParagraphStyle("t", parent=base["Title"], fontSize=20, alignment=TA_CENTER, spaceAfter=14)
    h2 = ParagraphStyle("h2", parent=base["Heading2"], fontSize=13, spaceBefore=12, spaceAfter=4)
    pie = ParagraphStyle("pie", parent=normal, fontName="Helvetica-Oblique", fontSize=9, spaceBefore=6)
    chico = ParagraphStyle("chico", parent=normal, fontSize=8, textColor=colors.HexColor("#555555"))

    nivel_color = COLOR_NIVEL.get(resultado["color"], "#000000")
    S = [Paragraph("Reporte de Riesgo Cardiovascular", titulo),
         Paragraph(f"Nombre del paciente: {_t(nombre_usuario)}", normal),
         Paragraph(f"Fecha del reporte: {_t(resultado['fecha'].replace('T', ' '))}", normal),
         Paragraph(f"Nivel de riesgo: <b><font color='{nivel_color}'>{_t(resultado['nivel'].capitalize())}"
                   f"</font></b> ({resultado['puntaje']} de {resultado['puntaje_maximo']} puntos)", normal)]

    S.append(Paragraph("Datos Personales:", h2))
    for linea in [f"Edad: {resultado['edad']} años (calculada)",
                  f"Género: {datos['genero'].capitalize()}",
                  f"Peso (kg): {datos['peso_kg']:g}",
                  f"Altura (cm): {datos['altura_cm']:g}",
                  f"IMC: {resultado['imc']} (calculado)",
                  f"Nivel de actividad física: {datos['actividad'].capitalize()}"]:
        S.append(Paragraph(_t(linea), normal))

    S.append(Paragraph("Hábitos Alimenticios:", h2))
    if datos.get("frutas"):
        for linea in [f"¿Consumes frutas?: {datos['frutas']}",
                      f"¿Consumes verduras?: {datos['verduras']}",
                      f"¿Consumes comida rápida?: {datos['comida_rapida']}",
                      f"¿Consumes bebidas azucaradas?: {datos['bebidas_azucaradas']}",
                      f"¿Cuánta agua tomas al día?: {AGUA.get(datos['agua'], datos['agua'])}"]:
            S.append(Paragraph(_t(linea), normal))
    S.append(Paragraph(f"Valoración general: {_t(datos['alimentacion'].replace('_', ' '))}", normal))

    S.append(Paragraph("Hábitos de consumo y antecedentes:", h2))
    for linea in [f"¿Fumas?: {SI_NO[datos['fuma']]}",
                  f"¿Consumes alcohol?: {SI_NO[datos['consume_alcohol']]}",
                  f"¿Tienes diabetes?: {SI_NO[datos['diabetes']]}",
                  f"¿Antecedentes familiares cardiovasculares?: {SI_NO[datos['antecedentes_familiares']]}"]:
        S.append(Paragraph(_t(linea), normal))

    S.append(Paragraph("Datos de presión arterial y colesterol:", h2))
    for linea in [f"Sistólica: {datos['presion_sistolica']} mmHg",
                  f"Diastólica: {datos['presion_diastolica']} mmHg",
                  f"Colesterol total: {datos['colesterol_total']:g} mg/dL",
                  f"Colesterol HDL: {datos['colesterol_hdl']:g} mg/dL"]:
        S.append(Paragraph(_t(linea), normal))
    for alerta in resultado["alertas"]:
        S.append(Paragraph(f"<b>Alerta:</b> {_t(alerta)}", normal))

    S.append(Paragraph("Aporte de cada factor al puntaje:", h2))
    filas = [["Factor", "Valor", "Puntos"]] + [[f["factor"], f["valor"], str(f["puntos"])]
                                              for f in resultado["factores"]]
    tabla = Table([[Paragraph(_t(c), normal) for c in fila] for fila in filas],
                  colWidths=[5.5 * cm, 8 * cm, 2.5 * cm])
    tabla.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#bbbbbb")),
                               ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eeeeee")),
                               ("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
    S.append(tabla)

    n = resultado.get("nutricion")
    if n:
        S.append(Paragraph("Estimación nutricional diaria:", h2))
        S.append(Paragraph(f"Calorías: {n['calorias']} kcal · Proteínas: {n['proteinas_g']} g · "
                           f"Grasas: {n['grasas_g']} g · Carbohidratos: {n['carbohidratos_g']} g", normal))

    S.append(Paragraph("Recomendaciones personalizadas:", h2))
    for r in resultado["recomendaciones"]:
        S.append(Paragraph(f"- {_t(r)}", normal))

    S += [Spacer(1, 14),
          Paragraph("Este reporte es generado automáticamente por el sistema de evaluación de riesgo "
                    "cardiovascular.", pie),
          Paragraph(_t(resultado["aviso"]), chico)]
    doc.build(S)
    return buf.getvalue()
