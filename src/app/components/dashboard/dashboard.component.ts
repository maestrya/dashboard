import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '../base.component';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';

@Component({
	selector: 'app-home',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends BaseComponent implements OnInit {
	@ViewChild('editor', { static: true }) editor: JsonEditorComponent;
	component = {
		form: null,
		formInputs: {
			apiUrl: {
				defaultValue: 'https://protected-ridge-35353.herokuapp.com/api/',
				disabled: true,
				value: 'Lorem ipsum',
			},
			data: {
				defaultValue: {},
				disabled: false,
				value: {},
				valid: true,
			},
			pageName: {
				defaultValue: null,
				disabled: true,
				value: null,
				options: []
			},
		},
		data: null,
		render: {
			class: {
				largeMdSm: 'col-lg-6 col-md-12',
			},
		},
	};
	options = new JsonEditorOptions();

	async ngOnInit() {
		this.options.mode = 'code';
		this.options.onChange = () => {
			try {
				this.onCaughtError(this.editor.get());
			} catch {
				this.onCaughtError(false);

			}
		};

		this.defineAllDefaultValues(this.component.formInputs);
		await this.getPages();

	}

	onCaughtError(valid) {
		if (!valid) {
			this.component.formInputs.data.valid = false;
		} else {
			this.component.formInputs.data.valid = true;
		}
	}

	jsonIsInvalid() {
		return (this.component.formInputs.data.valid === false);
	}

	changeFormInputApiUrl() {
		const { apiUrl } = this.component.formInputs;
	}

	clickEditFormInputApiUrl(): void {
		const { disabled } = this.component.formInputs.apiUrl;
		this.component.formInputs.apiUrl.disabled = !disabled;
	}

	checkFormInputsApiUrlDisabled() {
		return this.component.formInputs.apiUrl.disabled;
	}

	makeUrl(path = null) {
		const { value } = this.component.formInputs.apiUrl;
		return value.concat(path);
	}

	async getPages() {
		const url = this.makeUrl('pages')
		const response = await this.request.request(url);
		if (!response.error) {
			const { data } = response.result;
			this.component.formInputs.pageName.options = data;
			await this.checkGetPagesAsOne(response, data);
		}
	}

	async checkGetPagesAsOne(response, data) {
		if (response.result.data.length == 1) {
			this.component.formInputs.pageName.value = data[0].name;
			await this.getPage();
		}
	}

	async getPage() {
		const { value } = this.component.formInputs.pageName;
		const url = this.makeUrl('pages/'.concat(value));
		const response = await this.request.request(url);
		if (!response.error) {
			const { data } = response.result;
			this.component.formInputs.data.defaultValue = data;
			this.component.formInputs.data.value = data;
		}
	}

	async mutatePage(data) {
		const url = this.makeUrl('pages')
		const response = await this.request.request(url, 'POST', data);
		if (!response.error) {
			await this.getPage();
		}
	}

	async submit() {
		const jsonIsInvalid = this.jsonIsInvalid();
		if (!jsonIsInvalid) {
			const dataSend = {
				name: this.component.formInputs.pageName.value,
				data: this.editor.get()
			}
			await this.mutatePage(dataSend);
		}
	}

	reset() {
		const { defaultValue } = this.component.formInputs.data;
		this.component.formInputs.data.value = {};
		this.component.formInputs.data.value = defaultValue;
	}
}
