FROM python:3.12-slim

# git is required for public GitHub repository cloning
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/api

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV DATABASE_URL=sqlite:////srv/api/data/repo_doctor.db \
    WORKSPACE_ROOT=/srv/api/data/workspaces

RUN useradd -m repodoctor && mkdir -p /srv/api/data && chown -R repodoctor /srv/api
USER repodoctor

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
