import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupStep, StepStatus } from '../setup-types';

interface SidebarStep {
  id: SetupStep;
  label: string;
  description: string;
}

@Component({
  selector: 'app-setup-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './setup-sidebar.html',
  styleUrl: './setup-sidebar.css',
})
export class SetupSidebar {
  activeStep = input.required<SetupStep>();
  stepStatuses = input.required<Record<SetupStep, StepStatus>>();
  progress = input.required<number>();

  steps: SidebarStep[] = [
    { id: 'rules', label: 'Regras', description: 'Defina os critérios e pontuação' },
    { id: 'format', label: 'Formato', description: 'Escolha o sistema de disputa' },
    { id: 'teams', label: 'Equipes', description: 'Adicione os participantes' },
    { id: 'final-review', label: 'Revisão', description: 'Confirme todas as configurações' },
  ];
}
