import { CategoryService } from './../../categories/shared/category.service';
import { EntryService } from './../../entries/shared/entry.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import currencyFormatter from 'currency-formatter';
import { Category } from '../../categories/shared/category.model';
import { Entry } from '../../entries/shared/entry.model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  expenseTotal: any = 0;
  revenueTotal: any = 0;
  balance: any = 0;
  expenseChartData: any;
  revenueChartData: any;
  categories: Array<Category> = [];
  entries: Array<Entry> = [];

  chartOptions = {
    scales: {
      yAxes: [
        {
            ticks: {
              beginAtZero: true
          }
        }
      ]
    }
  };

  @ViewChild('month') month: ElementRef = null;
  @ViewChild('year') year: ElementRef = null;

  constructor(
    private entryService: EntryService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(
      categories => this.categories = categories
    );
  }

  generateReports(): void {
    const month = this.month.nativeElement.value;
    const year = this.year.nativeElement.value;

    if (!month || !year) {
      alert('Selecione o mês e o ano para geração dos relatórios.');
    } else {
      this.entryService.getByMonthAndYear(month, year).subscribe(
        this.setValues.bind(this)
      );
    }
  }

  private setValues(entries: Entry[]): void {
    this.entries = entries;
    this.calculateBalance();
    this.setChartData();
  }

  private calculateBalance(): void {
    let expenseTotal = 0;
    let revenueTotal = 0;

    this.entries.forEach(entry => {
      if (entry.type === 'revenue') {
        revenueTotal += currencyFormatter.unformat(entry.amount, { code: 'BRL' });
      } else {
        expenseTotal += currencyFormatter.unformat(entry.amount, { code: 'BRL' });
      }
    });

    this.expenseTotal = currencyFormatter.format(expenseTotal, { code: 'BRL' });
    this.revenueTotal = currencyFormatter.format(revenueTotal, { code: 'BRL' });
    this.balance = currencyFormatter.format(revenueTotal - expenseTotal, { code: 'BRL' });
  }

  private setChartData(): void {
    this.revenueChartData = this.getChartData('revenue', 'Gráfico de Receitas', '#9CCC65');
    this.expenseChartData = this.getChartData('expense', 'Gráfico de Despesas', '#E03131');
  }

  private getChartData(entryType: string, title: string, color: string): any {
    const chartData = [];

    this.categories.forEach(category => {
      const filteredEntries = this.entries.filter(
        entry => entry.categoryId === category.id && entry.type === entryType
      );

      if (filteredEntries.length > 0) {
        const totalAmount = filteredEntries.reduce(
          (total, entry) => total + currencyFormatter.unformat(entry.amount, { code: 'BRL' }), 0
        );

        chartData.push({
          categoryName: category.name,
          totalAmount: totalAmount
        });
      }
    });

    return {
      labels: chartData.map(category => category.categoryName),
      datasets: [
        {
          label: title,
          backgroundColor: color,
          data: chartData.map(item => item.totalAmount)
        }
      ]
    };
  }
}
