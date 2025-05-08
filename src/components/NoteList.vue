<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NoteCard from './NoteCard.vue';
import { GridIcon, ListIcon, EmptyNotesIcon, PrevIcon, NextIcon } from './icons';

export default {
  name: 'NoteList',
  components: {
    NoteCard
  },
  props: {
    notes: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: 'Notas'
    },
    loading: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    totalPages: {
      type: Number,
      default: 1
    }
  },
  emits: ['page-change', 'edit', 'delete', 'view', 'toggle-favorite'],
  setup(props, { emit }) {
    const router = useRouter();
    const viewMode = ref('grid');

    onMounted(() => {
      const storedViewMode = localStorage.getItem('notesViewMode');
      if (storedViewMode) {
        viewMode.value = storedViewMode;
      }
    });

    // Save view mode preference to localStorage
    watch(viewMode, (newMode) => {
      localStorage.setItem('notesViewMode', newMode);
    });

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date);
    };

    const paginationRange = computed(() => {
      const range = [];
      const maxVisiblePages = 5;
      
      if (props.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= props.totalPages; i++) {
          range.push(i);
        }
      } else {
        let start = Math.max(1, props.currentPage - Math.floor(maxVisiblePages / 2));
        let end = Math.min(props.totalPages, start + maxVisiblePages - 1);
        
        if (end - start + 1 < maxVisiblePages) {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
        
        for (let i = start; i <= end; i++) {
          range.push(i);
        }
      }
      
      return range;
    });

    const changePage = (page) => {
      if (page < 1 || page > props.totalPages) return;
      emit('page-change', page);
    };

    const viewNote = (id) => {
      emit('view', id);
      router.push(`/notes/${id}`);
    };

    const editNote = (id) => {
      emit('edit', id);
      router.push(`/notes/edit/${id}`);
    };

    const deleteNote = (id) => {
      emit('delete', id);
    };

    const toggleFavorite = (id) => {
      emit('toggle-favorite', id);
    };

    return {
      viewMode,
      formatDate,
      paginationRange,
      changePage,
      viewNote,
      editNote,
      deleteNote,
      toggleFavorite,
      GridIcon,
      ListIcon,
      EmptyNotesIcon,
      PrevIcon,
      NextIcon
    };
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ title }}</h2>
      <div class="flex items-center space-x-2">
        <button 
          @click="viewMode = 'grid'" 
          class="p-2 rounded-md transition-colors duration-200"
          :class="viewMode === 'grid' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'"
        >
          <span v-html="GridIcon"></span>
        </button>
        <button 
          @click="viewMode = 'list'" 
          class="p-2 rounded-md transition-colors duration-200"
          :class="viewMode === 'list' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'"
        >
          <span v-html="ListIcon"></span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
    </div>

    <div v-else-if="notes.length === 0" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
      <span v-html="EmptyNotesIcon"></span>
      <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay notas</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Comienza creando una nueva nota.</p>
      <div class="mt-6">
        <router-link to="/notes/new" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          Nueva Nota
        </router-link>
      </div>
    </div>

    <div v-else>
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="note in notes" :key="note.id" @click="viewNote(note.id)" class="cursor-pointer">
          <NoteCard 
            :note="note" 
            @edit="editNote" 
            @delete="deleteNote"
            @toggle-favorite="toggleFavorite"
          />
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Título</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="note in notes" :key="note.id" @click="viewNote(note.id)" class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <svg v-if="note.is_favorite" key="favorite-star" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ note.title }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {{ note.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(note.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click.stop="editNote(note.id)" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mr-3">
                    Editar
                  </button>
                  <button @click.stop="deleteNote(note.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex justify-center">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Anterior</span>
            <span v-html="PrevIcon"></span>
          </button>
          <button
            v-for="page in paginationRange"
            :key="page"
            @click="changePage(page)"
            :class="[
              page === currentPage ? 'z-10 bg-gray-100 dark:bg-gray-700 border-gray-500 text-gray-600 dark:text-gray-200' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
              'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Siguiente</span>
            <span v-html="NextIcon"></span>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Los estilos se manejan con Tailwind CSS */
</style>