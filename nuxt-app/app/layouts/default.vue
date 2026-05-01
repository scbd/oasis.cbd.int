<template>
  <div class="page">
    <!-- Sidebar (handles all navigation, mobile hamburger) -->
    <aside class="navbar navbar-vertical navbar-expand-lg" data-bs-theme="dark">
      <div class="container-fluid">
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidebar-menu"
          aria-controls="sidebar-menu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon" />
        </button>

        <NuxtLink to="/" class="navbar-brand navbar-brand-autodark">
          <span class="fw-bold">SCBD</span>
        </NuxtLink>

        <!-- Mobile-only: user avatar in sidebar header -->
        <div class="navbar-nav flex-row d-lg-none">
          <div v-if="auth.isAuthenticated" class="nav-item dropdown">
            <a
              href="#"
              class="nav-link d-flex lh-1 text-reset p-0"
              data-bs-toggle="dropdown"
              aria-label="Open user menu"
            >
              <span class="avatar avatar-sm">{{ auth.initials }}</span>
            </a>
            <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
              <a href="#" class="dropdown-item">Profile</a>
              <div class="dropdown-divider" />
              <button class="dropdown-item" @click="auth.signOut()">Sign out</button>
            </div>
          </div>
        </div>

        <!-- Sidebar nav links -->
        <div id="sidebar-menu" class="collapse navbar-collapse">
          <ul class="navbar-nav pt-lg-3">
            <li class="nav-item">
              <NuxtLink to="/" class="nav-link" :class="{ active: route.path === '/' }">
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
            <li class="nav-item">
              <a
                class="nav-link dropdown-toggle"
                href="#sidebar-clearing-house"
                data-bs-toggle="collapse"
                :aria-expanded="route.path.startsWith('/clearing-house')"
              >
                <IconDatabase class="nav-link-icon" />
                <span class="nav-link-title">Clearing-House</span>
              </a>
              <div
                id="sidebar-clearing-house"
                class="dropdown-menu"
                :class="{ show: route.path.startsWith('/clearing-house') }"
              >
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
    </aside>

    <!-- Top navbar — desktop only, sits alongside sidebar -->
    <header class="navbar navbar-expand-md d-none d-lg-flex d-print-none">
      <div class="container-xl">
        <div class="navbar-nav flex-row order-md-last ms-auto">
          <div v-if="auth.isAuthenticated" class="nav-item dropdown">
            <a
              href="#"
              class="nav-link d-flex lh-1 text-reset p-0"
              data-bs-toggle="dropdown"
              aria-label="Open user menu"
            >
              <span class="avatar avatar-sm">{{ auth.initials }}</span>
              <div class="d-none d-xl-block ps-2">
                <div class="small fw-medium">{{ auth.user?.name }}</div>
                <div class="small text-secondary">{{ auth.user?.email }}</div>
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

    <!-- Page wrapper -->
    <div class="page-wrapper">
      <!-- Page header: title + breadcrumbs -->
      <div class="page-header d-print-none">
        <div class="container-xl">
          <div class="row g-2 align-items-center">
            <div class="col">
              <ol class="breadcrumb mb-1" aria-label="breadcrumbs">
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
              <h2 v-if="pageTitle" class="page-title">{{ pageTitle }}</h2>
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

      <!-- Footer -->
      <footer class="footer footer-transparent d-print-none">
        <div class="container-xl">
          <div class="row text-center align-items-center">
            <div class="col-12 col-lg-auto">
              <ul class="list-inline list-inline-dots mb-0">
                <li class="list-inline-item text-secondary small">v{{ appVersion }}</li>
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
  import { useAuthStore } from '~/stores/auth'

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
