#!/usr/bin/env bash
set -eux

function deploy() {
  set -x
  local app_dir="/app2"
  local systemd_service_name="gitpodqa-discord-bot"

  # Get rid of bloat
  for i in apt-daily.timer update-notifier-download.timer update-notifier-motd.timer; do
          systemctl disable $i
          systemctl stop $i
  done
  apt purge -yq snapd unattended-upgrades

  # Install systemd service units
  cat > "/etc/systemd/system/${systemd_service_name}.service" <<EOF
[Unit]
Description=DiscordQA discord Bot
After=network.target

[Service]
ExecStartPre=sh -c 'git reset --hard && git pull --ff && pnpm install'
ExecStart=pnpm start:discord
Restart=always
WorkingDirectory=${app_dir}

[Install]
WantedBy=multi-user.target

EOF

    if ! test -e "${app_dir}"; then {
        git clone https://github.com/gitpod-io/gitpod-qa "${app_dir}"
        cd "${app_dir}"

    } fi

  systemctl daemon-reload
  systemctl enable "${systemd_service_name}"

  systemctl stop "${systemd_service_name}"
  systemctl start "${systemd_service_name}"
}

private_key=/tmp/.pkey
if test ! -e "$private_key"; then {
  base64 -d <<<"${PRIVATE_KEY_ENCODED}" > "$private_key"
  chmod 0600 "$private_key"
} fi

ssh_cmd=(
  ssh -i "${private_key}"
  -o UserKnownHostsFile=/dev/null
  -o StrictHostKeyChecking=no
  $SSH_LOGIN
)

printf '%s\n' \
  "$(declare -f deploy)" \
  "deploy" | "${ssh_cmd[@]}" -- bash
