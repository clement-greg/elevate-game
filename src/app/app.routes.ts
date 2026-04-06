import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'test',
        loadComponent: () => import('./test/test.component').then(c => c.TestComponent)
    },
    {
        path: 'kill-bill',
        loadComponent: () => import('./components/kill-bill/kill-bill.component').then(c => c.KillBillComponent)
    }
];
