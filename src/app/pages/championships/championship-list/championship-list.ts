import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-championship-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './championship-list.html',
  styleUrl: './championship-list.css',
})
export class ChampionshipList {}
