<script>
import { ref } from 'vue';
import { SearchIcon, CloseIcon } from './icons';

export default {
  name: 'SearchBar',
  emits: ['search'],
  setup(props, { emit }) {
    const searchQuery = ref('');

    const handleSearch = () => {
      emit('search', searchQuery.value);
    };

    const clearSearch = () => {
      searchQuery.value = '';
      emit('search', '');
    };

    return {
      searchQuery,
      handleSearch,
      clearSearch,
      SearchIcon,
      CloseIcon
    };
  }
}
</script>

<template>
  <div class="relative">
    <div class="flex rounded-md shadow-sm">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar notas..."
        class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
        @keyup.enter="handleSearch"
      />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute inset-y-0 right-10 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      >
        <span v-html="CloseIcon"></span>
      </button>
      <button
        @click="handleSearch"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
      >
        <span v-html="SearchIcon"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Los estilos se manejan con Tailwind CSS */
</style>