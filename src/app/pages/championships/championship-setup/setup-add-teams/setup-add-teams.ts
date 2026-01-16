import { Component, output } from '@angular/core';

@Component({
  selector: 'app-setup-add-teams',
  imports: [],
  templateUrl: './setup-add-teams.html',
  styleUrl: './setup-add-teams.css',
})
export class SetupAddTeams {
  advanced = output<'rules' | 'format' | 'teams'>();

  teams = [
    {
      name: 'Dragões Vermelhos FC',
      added: 'Adicionado hoje',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCXVnsZVhXoXUDrAPKyWN40RFuin_o4cUEVz60toNcLIXoLhPeYNBM7sXjxDqHAgIEhIYJgx665ZxymgIfXzDrsQSGzMpbNZ9pe5HurOf5Pf6CkeWBI6725TeFVY9czcoTv27u5k253aF8U4oOxTOJ_vKOMYTI3zTgLCLTn98b4cmL1qToDnAiVYdbbmLT6pxrBR1sppMEFmNQwZchJZYRHfU4_C2dCKJWx9vO1Mh2NxHdgdRjg2CRt7n3qO-6JsFEcrrnlQd0asik',
    },
    {
      name: 'Águias Azuis',
      added: 'Adicionado hoje',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB2WA6ycoX7EdAW5RCDrvNVtmmf2XpJvYzf-9vYXBSUmI2ZRJ8kDZG_PnycErzaLps9w3p1mDdi7q8_Hf_Flgk88U3Bj5fR34AUa3zEyRVxb_Rfa01oVvfzGsmB9WoFn_LTynp802xHzZ-fOxMhGH7nGN7i0wwCzTbC2NB9wzjuZt5jqpx7iKWdIvkWv4T1a6UyttFk_Pzk1Su3V_a4L6-eQrJImJLKkKY9MRyNXLiYtpNmxQpcJnrrZOKiNOLicC-wEZ3OL_DVZo0',
    },
    {
      name: 'Verdão da Massa',
      added: 'Adicionado hoje',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAIsOWcDqCvQ2xdU9Liu2Vc6AhJqEpUTGhX265xQugsi2ANNgjmJaWzxTq-T030-9UVjq_h2iqsx30Xgj83G2VdiG_wZ-fMgf--n-4MofIh8RacfuDDSvWML5rlqlBhLiqSW6UCQzi8jCGQoKWe4tXxCCAjycdJ0RZADDzklYtpd8LMWI2PCUrd3JM6IWddy5P6NTMkjWcYTb1PSJ8AvhZxX5TGGPVC2I830na-Ag8NCDsaO3sUdqJB6Yof6wSeeB3MLz1eR9RcKYg',
    },
    {
      name: 'Canarinhos',
      added: 'Adicionado ontem',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD7nQO8s2nJpPP7KHIiI7hSa8gKVkJZf5AYbqj2866Qj--bXyXfddFLJj4W0uSAaHL4tegLQLz2jhEMQxS4rgmS7-qnc-jDzEZrDZua0ASl3Qbtzd5x2P4sNvsaeusZEOlTFNvs7GrExzhI0h6_GthCGOgqv9B_xT1jQcCogcvQjsG4ibgyTuTiV0q9e6oMtG3I6C5Zj7qxi4kcJlICAGlkPnURbt24TwZr4YUSaYUhAGoIbyH_oyW8LfwrF_E-k-CDqqDOdGBPc8I',
    },
    {
      name: 'Fúria Rubra',
      added: 'Adicionado ontem',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC1vws2rCc94Qpnde4l2nxjQMrTJsu7LYto56qEbvex6MzYi2qoF__ubOoGGv64ZkqgNUfDzWfx4Lsgz4-q1K_3gSq8a0Bp9VBnv3hTIU4cC74ov-QDXcBx1SLEq05sFbUTaqjhfNHdh4vvw5WSmTOoxWFusAq6KcT46rZRrsj0LhuY_c2Dqnd1UusEDkkGMT4gKLepSIe7eXSkTckayy1_spZgydbqJcmwEwOverD6ufiwgMyZGzHsrtjxNOzuOhQ45zPSKt_Ylwg',
    },
    {
      name: 'Roxos FC',
      added: 'Adicionado ontem',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDoknDKA3e4vV02ecvt-sSd5nhjYrKyCW4D0TmvPFs1M1RP-yGGjdkyq2a4mmxezhnIVCqvCIV6Toq7Ldg1Cgg74YDUUD0GbcIjrIBGk47B4efQByAFTBLXRuICggBbhLx2ZTfdHrSVpC6aEpJ0TUXMAn83lAzvT5s9dlf8XL4x3Vjm3va2p1fZwUazFC-Qv64lPg4Yfp5KbeTo_4fNAWfGiNR1KXd30cLEnHPl5r7QwjV4X1AdBuuUAA8wT7WYvfp-gPaqc9pJxMs',
    },
  ];

  saveAndContinue() {
    this.advanced.emit('rules');
  }

  returnToPrevious() {
    this.advanced.emit('format');
  }
}
