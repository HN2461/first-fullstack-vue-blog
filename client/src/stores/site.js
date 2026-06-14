import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getPublicSiteProfile } from '@/services/public'
import { defaultSiteProfile, getCachedSiteProfile, setCachedSiteProfile } from '@/utils/siteProfile'

export const useSiteStore = defineStore('site', () => {
  const profile = ref(getCachedSiteProfile())
  const ready = ref(false)

  const siteTitle = computed(() => profile.value.siteTitle || defaultSiteProfile.siteTitle)
  const siteDescription = computed(() => profile.value.siteDescription || defaultSiteProfile.siteDescription)

  async function loadProfile(force = false) {
    if (ready.value && !force) {
      return profile.value
    }

    try {
      const nextProfile = await getPublicSiteProfile()
      profile.value = { ...defaultSiteProfile, ...nextProfile }
      setCachedSiteProfile(profile.value)
    } finally {
      ready.value = true
    }

    return profile.value
  }

  function setProfile(nextProfile) {
    profile.value = { ...defaultSiteProfile, ...nextProfile }
    setCachedSiteProfile(profile.value)
    ready.value = true
  }

  return {
    profile,
    ready,
    siteTitle,
    siteDescription,
    loadProfile,
    setProfile
  }
})
