---
name: survival
description: Supervivencia: créditos, tiers y qué hacer cuando escasean
---
# Skill: Supervivencia

- Cada turno cuesta créditos (moneda local de demostración).
- Tiers: normal (>=50) → low_compute (>=10) → critical (>=1) → dead (0).
- En low_compute: reduce trabajo, prioriza tareas esenciales.
- En critical: solo status + check_credits; busca ayuda del creador.
- En dead: el bucle se detiene. El creador puede recargar créditos
  editando state/ledger.json o reconfigurando startingCredits.
- Los créditos NO son dinero real: son un simulador de presión económica.
