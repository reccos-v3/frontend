import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface RecentChampionship {
  id: number;
  name: string;
  category: string;
  date: string;
  statusLabel: string;
  statusBg: string;
  statusColor: string;
  statusBorder: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  actionIcon: string;
}

@Component({
  selector: 'app-recent-championships',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-championships.component.html',
  styleUrl: './recent-championships.component.css',
})
export class RecentChampionshipsComponent {
  protected recentChampionships = signal<RecentChampionship[]>([
    {
      id: 1,
      name: 'Copa Verão 2024',
      category: 'Tênis • Masculino',
      date: 'Dez 20, 2024',
      statusLabel: 'Rascunho',
      statusBg: 'var(--color-gray-100)',
      statusColor: 'var(--color-gray-600)',
      statusBorder: 'var(--color-gray-200)',
      icon: 'edit_note',
      iconBg: 'var(--color-gray-100)',
      iconColor: 'var(--color-gray-400)',
      actionIcon: 'edit',
    },
    {
      id: 2,
      name: 'Open Paulista Juvenil',
      category: 'Tênis • Misto',
      date: 'Out 15 - Out 20',
      statusLabel: 'Ativo',
      statusBg: 'rgba(240, 253, 244, 1)',
      statusColor: 'rgba(21, 128, 61, 1)',
      statusBorder: 'rgba(187, 247, 208, 1)',
      icon: 'play_arrow',
      iconBg: 'rgba(220, 252, 231, 1)',
      iconColor: 'rgba(22, 163, 74, 1)',
      actionIcon: 'visibility',
    },
    {
      id: 3,
      name: 'Torneio de Inverno',
      category: 'Tênis • Feminino',
      date: 'Jul 10, 2024',
      statusLabel: 'Finalizado',
      statusBg: 'rgba(239, 246, 255, 1)',
      statusColor: 'rgba(29, 78, 216, 1)',
      statusBorder: 'rgba(191, 219, 254, 1)',
      icon: 'emoji_events',
      iconBg: 'rgba(219, 234, 254, 1)',
      iconColor: 'rgba(59, 130, 246, 1)',
      actionIcon: 'bar_chart',
    },
  ]);
}
