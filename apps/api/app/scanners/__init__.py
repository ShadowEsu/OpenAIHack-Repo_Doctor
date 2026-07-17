from app.scanners.base import RepositoryScanner, ScanFinding
from app.scanners.broken_imports import BrokenImportsScanner
from app.scanners.dead_files import DeadFilesScanner
from app.scanners.documentation import DocumentationScanner
from app.scanners.duplicate_code import DuplicateCodeScanner
from app.scanners.env_variables import EnvVariablesScanner
from app.scanners.error_handling import ErrorHandlingScanner
from app.scanners.giant_files import GiantFilesScanner
from app.scanners.secrets import SecretsScanner
from app.scanners.unused_dependencies import UnusedDependenciesScanner
from app.scanners.weak_tests import WeakTestsScanner

ALL_SCANNERS: list[type[RepositoryScanner]] = [
    BrokenImportsScanner,   # must run first: builds the import graph on the context
    SecretsScanner,
    EnvVariablesScanner,
    GiantFilesScanner,
    DuplicateCodeScanner,
    DeadFilesScanner,
    UnusedDependenciesScanner,
    WeakTestsScanner,
    DocumentationScanner,
    ErrorHandlingScanner,
]

__all__ = ["RepositoryScanner", "ScanFinding", "ALL_SCANNERS"]
