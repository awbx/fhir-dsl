#!/bin/zsh
# fhir-dsl-spec-audit tmux dashboard
# Attach with:   tmux attach -t fhir-audit
# Detach with:   Ctrl-b d
# Kill with:     tmux kill-session -t fhir-audit
set -euo pipefail

SESSION="fhir-audit"
TEAM_DIR="/Users/awbx/.claude/teams/fhir-dsl-spec-audit"
TASKS_DIR="/Users/awbx/.claude/tasks/fhir-dsl-spec-audit"
AUDIT_DIR="/Users/awbx/open-source/fhir-dsl/audit"

if tmux has-session -t "$SESSION" 2>/dev/null; then
  tmux kill-session -t "$SESSION"
fi

# Window 0: task list + audit tree
tmux new-session -d -s "$SESSION" -n overview -x 220 -y 55
tmux send-keys -t "$SESSION:overview" \
  "watch -n 2 -c 'echo \"=== TASKS (by ID) ===\"; for f in ${TASKS_DIR}/*.json; do jq -r \"[(.id|tostring), .status, (.owner // \\\"-\\\"), .subject] | @tsv\" \"\$f\"; done | sort -n | column -t -s \$\"\\t\"'" C-m

tmux split-window -h -t "$SESSION:overview" -p 45
tmux send-keys -t "$SESSION:overview.1" \
  "watch -n 2 -c 'echo \"=== AUDIT OUTPUTS (${AUDIT_DIR}) ===\"; find ${AUDIT_DIR} -type f 2>/dev/null | sort; echo; echo \"=== NEW TEST FILES ===\"; find /Users/awbx/open-source/fhir-dsl/packages -name \"spec-compliance*\" -o -name \"rest-spec-compliance*\" -o -name \"search-spec-compliance*\" -o -name \"search-url-encoding*\" 2>/dev/null'" C-m

# Window 1: per-agent inbox tails (6 panes)
tmux new-window -t "$SESSION" -n inboxes
tmux send-keys -t "$SESSION:inboxes" \
  "echo '=== spec-reader ==='; tail -F ${TEAM_DIR}/inboxes/spec-reader.json" C-m
tmux split-window -t "$SESSION:inboxes" -v
tmux send-keys -t "$SESSION:inboxes.1" \
  "echo '=== dsl-explorer ==='; tail -F ${TEAM_DIR}/inboxes/dsl-explorer.json" C-m
tmux split-window -t "$SESSION:inboxes" -h
tmux send-keys -t "$SESSION:inboxes.2" \
  "echo '=== test-engineer ==='; tail -F ${TEAM_DIR}/inboxes/test-engineer.json" C-m
tmux select-pane -t "$SESSION:inboxes.0"
tmux split-window -t "$SESSION:inboxes" -h
tmux send-keys -t "$SESSION:inboxes.1" \
  "echo '=== spec-challenger ==='; tail -F ${TEAM_DIR}/inboxes/spec-challenger.json" C-m
tmux select-pane -t "$SESSION:inboxes.3"
tmux split-window -t "$SESSION:inboxes" -v
tmux send-keys -t "$SESSION:inboxes.4" \
  "echo '=== docs-engineer ==='; tail -F ${TEAM_DIR}/inboxes/docs-engineer.json" C-m
tmux split-window -t "$SESSION:inboxes.4" -h
tmux send-keys -t "$SESSION:inboxes.5" \
  "echo '=== team-lead ==='; tail -F ${TEAM_DIR}/inboxes/team-lead.json" C-m

# Window 2: test runner (you drive it)
tmux new-window -t "$SESSION" -n tests -c /Users/awbx/open-source/fhir-dsl
tmux send-keys -t "$SESSION:tests" "echo 'Run: pnpm test'; echo 'Or scope: pnpm --filter @fhir-dsl/fhirpath test --run'" C-m

# Window 3: git status watcher
tmux new-window -t "$SESSION" -n git -c /Users/awbx/open-source/fhir-dsl
tmux send-keys -t "$SESSION:git" \
  "watch -n 3 'git status --short; echo; echo \"--- Last commit ---\"; git log --oneline -1'" C-m

# Start on the overview window
tmux select-window -t "$SESSION:overview"

echo "Session '$SESSION' ready."
echo "Attach:   tmux attach -t $SESSION"
echo "Windows:  0=overview (tasks+outputs)  1=inboxes  2=tests  3=git"
