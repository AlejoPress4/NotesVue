<script>
import { StarIcon, EditIcon, DeleteIcon } from './icons';

export default {
  name: 'NoteCard',
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'delete', 'toggle-favorite'],
  setup(props, { emit }) {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date);
    };

    const toggleFavorite = (event) => {
      event.stopPropagation();
      emit('toggle-favorite', props.note.id);
    };

    return {
      formatDate,
      toggleFavorite,
      StarIcon,
      EditIcon,
      DeleteIcon
    };
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all duration-200 overflow-hidden">
    <div class="p-4">
      <div class="flex justify-between items-start">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white truncate">{{ note.title }}</h3>
        <button @click.stop="toggleFavorite" class="text-gray-400 hover:text-yellow-500 transition-colors duration-200">
          <span v-html="StarIcon" :class="{ 'text-yellow-500 fill-current': note.is_favorite }"></span>
        </button>
      </div>
      <div class="mt-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          {{ note.category }}
        </span>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{{ note.content }}</p>
      </div>
      <div class="mt-4 flex justify-between items-center">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(note.created_at) }}</span>
        <div class="flex space-x-2">
          <button @click.stop="$emit('edit', note.id)" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200">
            <span v-html="EditIcon"></span>
          </button>
          <button @click.stop="$emit('delete', note.id)" class="text-gray-400 hover:text-red-500 transition-colors duration-200">
            <span v-html="DeleteIcon"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Los estilos se manejan con Tailwind CSS */
</style>