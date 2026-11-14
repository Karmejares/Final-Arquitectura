"""CONTROLADOR (MVC) · HU-11 a HU-16: evaluar, guardar, consultar historial y descargar el PDF.

Recibe la petición HTTP, llama a un servicio del Modelo y devuelve la respuesta (JSON o PDF).
No contiene reglas de negocio ni SQL.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response

from ..container import Contenedor, get_contenedor, usuario_actual
from ..models.models import DatosEvaluacion, ItemHistorial, RegistroPresion, ResultadoEvaluacion
from ..views.report import generar_pdf
from ..models.services import EvaluacionNoEncontrada

router = APIRouter(prefix="/api/evaluaciones", tags=["evaluaciones"],
                   responses={401: {"description": "Falta el token o la sesión expiró."}})


@router.post("", response_model=ResultadoEvaluacion,
             summary="Evaluar el riesgo y guardar el resultado (HU-11 a HU-14)",
             responses={422: {"description": "Datos de la evaluación inválidos."}})
def crear_evaluacion(datos: DatosEvaluacion,
                     usuario: dict = Depends(usuario_actual),
                     c: Contenedor = Depends(get_contenedor)):
    return c.evaluaciones.evaluar(usuario["id"], datos)


@router.get("", response_model=List[ItemHistorial],
            summary="Historial de evaluaciones del usuario, la más reciente primero (HU-15)")
def listar_historial(usuario: dict = Depends(usuario_actual),
                     c: Contenedor = Depends(get_contenedor)):
    return c.historial.listar(usuario["id"])


# Debe declararse ANTES de "/{evaluacion_id}"; si no, "presiones" se interpretaría como un id.
@router.get("/presiones", response_model=List[RegistroPresion],
            summary="Registros de presión arterial del usuario (HU-09)")
def historial_presiones(usuario: dict = Depends(usuario_actual),
                        c: Contenedor = Depends(get_contenedor)):
    return c.historial.presiones(usuario["id"])


def _buscar(c: Contenedor, usuario: dict, evaluacion_id: int) -> dict:
    try:
        return c.historial.obtener(usuario["id"], evaluacion_id)
    except EvaluacionNoEncontrada:   # no existe o es de otro usuario: misma respuesta
        raise HTTPException(status_code=404, detail="Evaluación no encontrada.")


@router.get("/{evaluacion_id}", response_model=ResultadoEvaluacion,
            summary="Detalle de una evaluación del usuario (HU-15)",
            responses={404: {"description": "Evaluación no encontrada."}})
def detalle(evaluacion_id: int,
            usuario: dict = Depends(usuario_actual),
            c: Contenedor = Depends(get_contenedor)):
    return _buscar(c, usuario, evaluacion_id)["resultado"]


@router.get("/{evaluacion_id}/pdf",
            summary="Descargar el reporte en PDF (HU-16)",
            responses={200: {"content": {"application/pdf": {}}, "description": "Archivo PDF."},
                       404: {"description": "Evaluación no encontrada."}})
def reporte_pdf(evaluacion_id: int,
                usuario: dict = Depends(usuario_actual),
                c: Contenedor = Depends(get_contenedor)):
    fila = _buscar(c, usuario, evaluacion_id)
    pdf = generar_pdf(usuario["nombre"], fila["resultado"], fila["datos"])
    return Response(content=pdf, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="cardioprev-evaluacion-{evaluacion_id}.pdf"'})
