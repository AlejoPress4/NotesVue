import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import NoteDetail from '../pages/NoteDetail.vue';
import Favorites from '../pages/Favorites.vue';
import NoteForm from '../components/NoteForm.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/notes/:id',
    name: 'NoteDetail',
    component: NoteDetail,
    props: true
  },
  {
    path: '/notes/new',
    name: 'NewNote',
    component: NoteForm
  },
  {
    path: '/notes/edit/:noteId',
    name: 'EditNote',
    component: NoteForm,
    props: true
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;