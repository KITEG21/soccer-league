---
layout: page
title: Equipo
description: Creadores de SoccerLeague y sus perfiles de GitHub.
---

<script setup>
import { VPTeamPage, VPTeamPageTitle, VPTeamMembers } from 'vitepress/theme'
import { creators } from './.vitepress/creators'
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>El equipo de SoccerLeague</template>
    <template #lead>Creadores de la aplicación. Conoce sus perfiles y proyectos en GitHub.</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="small" :members="creators" />
</VPTeamPage>
