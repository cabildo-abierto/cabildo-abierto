#!/usr/bin/env bash
set -euo pipefail

# Install only Cabildo's named profile; leave docker-default and global sysctls intact.
# Seccomp base: https://github.com/moby/profiles/tree/2ceae35d351c156cb5a8efc0fdc4a08cf94569d8
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROFILE_SOURCE="${SCRIPT_DIR}/../security/apparmor-cabildo-backend-jq"
PROFILE_DESTINATION=/etc/apparmor.d/cabildo-backend-jq
if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root to install cabildo-backend-jq."
  exit 1
fi
if ! command -v apparmor_parser >/dev/null 2>&1 || [ "$(cat /sys/module/apparmor/parameters/enabled 2>/dev/null || true)" != Y ]; then
  echo "AppArmor must be installed and enabled for dataset isolation."
  exit 1
fi
# Validate before changing the kernel or persistent policy.
apparmor_parser --skip-kernel-load --skip-read-cache "$PROFILE_SOURCE"
apparmor_parser --replace "$PROFILE_SOURCE"
install -m 0644 "$PROFILE_SOURCE" "$PROFILE_DESTINATION"
echo "Installed cabildo-backend-jq; Docker's default profile remains unchanged."
