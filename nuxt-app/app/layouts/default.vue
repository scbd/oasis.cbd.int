<template>
  <div class="antialiased">
    <!-- Top navbar -->
    <header class="navbar navbar-expand-md navbar-dark d-print-none">
      <div class="container-xl">
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar-menu"
          aria-controls="navbar-menu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon" />
        </button>

        <NuxtLink
          to="/"
          class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3"
        >
          <span class="fw-bold">SCBD</span>
        </NuxtLink>

        <div class="navbar-nav flex-row order-md-last">
          <div v-if="auth.isAuthenticated" class="nav-item dropdown">
            <a
              href="#"
              class="nav-link d-flex lh-1 text-reset p-0"
              data-bs-toggle="dropdown"
              aria-label="Open user menu"
            >
              <span class="avatar avatar-sm">
                {{ auth.initials }}
              </span>
              <div class="d-none d-xl-block ps-2">
                <div>{{ auth.user?.name }}</div>
                <div class="mt-1 small text-secondary">{{ auth.user?.email }}</div>
              </div>
            </a>
            <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
              <a href="#" class="dropdown-item">Profile</a>
              <div class="dropdown-divider" />
              <button class="dropdown-item" @click="auth.signOut()">Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Vertical sidebar -->
    <div id="navbar-menu" class="navbar-vertical navbar-expand-lg">
      <div class="container-xl">
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar-menu"
        >
          <span class="navbar-toggler-icon" />
        </button>

        <div class="collapse navbar-collapse">
          <ul class="navbar-nav pt-lg-3">
            <li class="nav-item">
              <NuxtLink to="/" class="nav-link" active-class="active">
                <IconLayoutDashboard class="nav-link-icon" />
                <span class="nav-link-title">Dashboard</span>
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/projects" class="nav-link" active-class="active">
                <IconFolders class="nav-link-icon" />
                <span class="nav-link-title">Projects</span>
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/translation" class="nav-link" active-class="active">
                <IconLanguage class="nav-link-icon" />
                <span class="nav-link-title">Translation</span>
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/articles" class="nav-link" active-class="active">
                <IconArticle class="nav-link-icon" />
                <span class="nav-link-title">Articles</span>
              </NuxtLink>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#sidebar-clearing-house"
                data-bs-toggle="collapse"
                role="button"
                aria-expanded="false"
              >
                <IconDatabase class="nav-link-icon" />
                <span class="nav-link-title">Clearing-House</span>
              </a>
              <div id="sidebar-clearing-house" class="dropdown-menu">
                <div class="dropdown-menu-columns">
                  <div class="dropdown-menu-column">
                    <NuxtLink to="/clearing-house" class="dropdown-item" active-class="active"
                      >Realms</NuxtLink
                    >
                    <NuxtLink
                      to="/clearing-house/records"
                      class="dropdown-item"
                      active-class="active"
                      >Records</NuxtLink
                    >
                    <NuxtLink
                      to="/clearing-house/records/history"
                      class="dropdown-item"
                      active-class="active"
                      >Record History</NuxtLink
                    >
                    <NuxtLink
                      to="/clearing-house/records/failed-workflows"
                      class="dropdown-item"
                      active-class="active"
                      >Failed Workflows</NuxtLink
                    >
                  </div>
                </div>
              </div>
            </li>
            <li class="nav-item">
              <NuxtLink to="/widgets" class="nav-link" active-class="active">
                <IconComponents class="nav-link-icon" />
                <span class="nav-link-title">Widgets</span>
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/mailbox" class="nav-link" active-class="active">
                <IconMail class="nav-link-icon" />
                <span class="nav-link-title">Mailbox</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Page wrapper -->
    <div class="page-wrapper">
      <!-- Breadcrumbs -->
      <div class="page-header d-print-none">
        <div class="container-xl">
          <div class="row g-2 align-items-center">
            <div class="col">
              <ol class="breadcrumb" aria-label="breadcrumbs">
                <li class="breadcrumb-item">
                  <a href="https://www.cbd.int" target="_blank" rel="noopener">CBD</a>
                </li>
                <li
                  v-for="(crumb, i) in breadcrumbs"
                  :key="crumb.path"
                  class="breadcrumb-item"
                  :class="{ active: i === breadcrumbs.length - 1 }"
                >
                  <NuxtLink v-if="i < breadcrumbs.length - 1" :to="crumb.path">{{
                    crumb.label
                  }}</NuxtLink>
                  <span v-else>{{ crumb.label }}</span>
                </li>
              </ol>
              <h2 v-if="pageTitle" class="page-title mt-1">{{ pageTitle }}</h2>
            </div>
          </div>
        </div>
      </div>

      <!-- Page body -->
      <div class="page-body">
        <div class="container-xl">
          <slot />
        </div>
      </div>

      <footer class="footer footer-transparent d-print-none">
        <div class="container-xl">
          <div class="row text-center align-items-center flex-row-reverse">
            <div class="col-12 col-lg-auto">
              <ul class="list-inline list-inline-dots mb-0">
                <li class="list-inline-item">v{{ appVersion }}</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    IconLayoutDashboard,
    IconFolders,
    IconLanguage,
    IconArticle,
    IconDatabase,
    IconComponents,
    IconMail
  } from '@tabler/icons-vue'

  const auth = useAuthStore()
  const route = useRoute()

  const appVersion = useRuntimeConfig().public.appVersion ?? ''

  interface Breadcrumb {
    label: string
    path: string
  }

  const breadcrumbs = computed<Breadcrumb[]>(() => {
    return (route.meta.breadcrumbs as Breadcrumb[]) ?? []
  })

  const pageTitle = computed<string>(() => {
    return (route.meta.title as string) ?? ''
  })
</script>
