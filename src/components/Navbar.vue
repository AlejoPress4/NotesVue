<script>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import SearchBar from './SearchBar.vue';
import { SearchIcon, StarIcon, SunIcon, MoonIcon, MenuIcon, CloseIcon, PlusIcon } from './icons';

export default {
  name: 'Navbar',
  components: {
    SearchBar
  },
  setup() {
    const router = useRouter();
    const isDark = ref(document.documentElement.classList.contains('dark'));
    const isSearchVisible = ref(false);
    const isMenuOpen = ref(false);

    const toggleDarkMode = () => {
      isDark.value = !isDark.value;
      if (isDark.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    };

    const toggleSearch = () => {
      isSearchVisible.value = !isSearchVisible.value;
      // Close mobile menu when search is toggled
      isMenuOpen.value = false;
    };

    const handleSearch = (query) => {
      router.push({ path: '/', query: { search: query } });
      isSearchVisible.value = false;
      // Close mobile menu when search is performed
      isMenuOpen.value = false;
    };

    return {
      isDark,
      toggleDarkMode,
      isSearchVisible,
      toggleSearch,
      handleSearch,
      isMenuOpen,
      SearchIcon,
      StarIcon,
      SunIcon,
      MoonIcon,
      MenuIcon,
      CloseIcon,
      PlusIcon
    };
  }
}
</script>

<template>
  <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center">
            <span class="text-xl font-semibold text-gray-900 dark:text-white">NotesVue</span>
          </router-link>
        </div>
        <div class="hidden md:flex items-center space-x-4">
          <button @click="toggleSearch" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <span v-html="SearchIcon"></span>
          </button>
          <router-link to="/favorites" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <span v-html="StarIcon"></span>
          </router-link>
          <button @click="toggleDarkMode" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <span v-if="isDark" v-html="SunIcon"></span>
            <span v-else v-html="MoonIcon"></span>
          </button>
          <router-link to="/notes/new" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
            Nueva Nota
          </router-link>
        </div>
        
        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <button @click="isMenuOpen = !isMenuOpen" class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
            <span v-if="!isMenuOpen" v-html="MenuIcon"></span>
            <span v-else v-html="CloseIcon"></span>
          </button>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div v-if="isMenuOpen" class="md:hidden">
        <div class="pt-2 pb-4 space-y-1">
          <button @click="toggleSearch" class="w-full flex items-center px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <span v-html="SearchIcon" class="mr-3"></span>
            Buscar
          </button>
          <router-link to="/favorites" class="w-full flex items-center px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <span v-html="StarIcon" class="mr-3"></span>
            Favoritos
          </router-link>
          <button @click="toggleDarkMode" class="w-full flex items-center px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <span v-if="isDark" v-html="SunIcon" class="mr-3"></span>
            <span v-else v-html="MoonIcon" class="mr-3"></span>
            Modo {{ isDark ? 'Claro' : 'Oscuro' }}
          </button>
          <router-link to="/notes/new" class="w-full flex items-center px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <span v-html="PlusIcon" class="mr-3"></span>
            Nueva Nota
          </router-link>
        </div>
      </div>
      
      <div v-if="isSearchVisible" class="py-4">
        <SearchBar @search="handleSearch" />
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Los estilos se manejan con Tailwind CSS */
</style>