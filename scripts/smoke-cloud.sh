#!/bin/sh
set -eu

api_url=${1:?API URL is required}
curl --fail --silent --show-error "${api_url}/health" >/dev/null
curl --fail --silent --show-error "${api_url}/ready" >/dev/null
printf '%s\n' 'Cloud Run health and readiness checks passed.'
