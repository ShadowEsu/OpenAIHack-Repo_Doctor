from app.treatments.base import (
    FileOperation,
    TreatmentGenerator,
    TreatmentNotApplicable,
    TreatmentProposal,
)
from app.treatments.env_example import EnvExampleTreatment
from app.treatments.improve_readme import ImproveReadmeTreatment
from app.treatments.remove_dead_file import RemoveDeadFileTreatment
from app.treatments.remove_unused_import import RemoveUnusedImportTreatment

TREATMENT_GENERATORS: dict[str, TreatmentGenerator] = {
    gen.treatment_type: gen
    for gen in (
        EnvExampleTreatment(),
        RemoveUnusedImportTreatment(),
        ImproveReadmeTreatment(),
        RemoveDeadFileTreatment(),
    )
}

__all__ = [
    "FileOperation",
    "TreatmentGenerator",
    "TreatmentNotApplicable",
    "TreatmentProposal",
    "TREATMENT_GENERATORS",
]
