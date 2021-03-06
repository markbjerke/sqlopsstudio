/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Component, Input, ContentChild, OnDestroy, TemplateRef, ChangeDetectorRef, forwardRef, Inject } from '@angular/core';

import { Action } from 'vs/base/common/actions';

export abstract class TabChild {
	public abstract layout(): void;
}

@Component({
	selector: 'tab',
	template: `
		<div role="tabpanel" [attr.aria-labelledby]="identifier" tabindex="0" class="visibility" [class.hidden]="shouldBeHidden()" *ngIf="shouldBeIfed()" class="fullsize">
			<ng-container *ngTemplateOutlet="templateRef"></ng-container>
		</div>
	`
})
export class TabComponent implements OnDestroy {
	@ContentChild(TabChild) private _child: TabChild;
	@ContentChild(TemplateRef) templateRef;
	@Input() public title: string;
	@Input() public canClose: boolean;
	@Input() public actions: Array<Action>;
	@Input() public iconClass: string;
	public _active = false;
	@Input() public identifier: string;
	@Input() private visibilityType: 'if' | 'visibility' = 'if';
	private rendered = false;

	constructor(
		@Inject(forwardRef(() => ChangeDetectorRef)) private _cd: ChangeDetectorRef
	) { }

	public set active(val: boolean) {
		this._active = val;
		if (this.active) {
			this.rendered = true;
		}
		this._cd.detectChanges();
		if (this.active && this._child) {
			this._child.layout();
		}
	}

	public get active(): boolean {
		return this._active;
	}

	ngOnDestroy() {
		if (this.actions && this.actions.length > 0) {
			this.actions.forEach((action) => action.dispose());
		}
	}

	shouldBeIfed(): boolean {
		if (this.active) {
			return true;
		} else if (this.visibilityType === 'visibility' && this.rendered) {
			return true;
		} else {
			return false;
		}
	}

	shouldBeHidden(): boolean {
		if (this.visibilityType === 'visibility' && !this.active) {
			return true;
		} else {
			return false;
		}
	}

	public layout() {
		this._child.layout();
	}
}
