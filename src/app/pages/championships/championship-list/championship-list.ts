import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableList } from './components/table-list/table-list';
import { SequenceList } from './components/sequence-list/sequence-list';
import { StepList } from './components/step-list/step-list';

@Component({
  selector: 'app-championship-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableList, SequenceList, StepList],
  templateUrl: './championship-list.html',
  styleUrl: './championship-list.css',
})
export class ChampionshipList {}
