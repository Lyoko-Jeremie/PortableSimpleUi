import { BehaviorSubject, Subject } from 'rxjs';
import { createZoneWrapper } from '../src/core';
import { Text } from '../src/components/basic';

describe('RxJS support', () => {
    const zoneWrapper = createZoneWrapper('test-zone');

    it('should support BehaviorSubject in DynamicValue', () => {
        const subject = new BehaviorSubject('initial');
        const textComp = new Text({ text: subject }, zoneWrapper);

        // 初始值解析
        textComp.render();
        expect(textComp.getElement().textContent).toBe('initial');

        // 更新值
        subject.next('updated');
        // 由于 RxJS 订阅中调用了 markDirty()，而 Text 组件在 render 中会重新 resolveValue
        // 在我们的测试环境中，我们需要手动调用 render 或等待 Zone 触发
        textComp.render();
        expect(textComp.getElement().textContent).toBe('updated');
    });

    it('should support Subject in DynamicValue', () => {
        const subject = new Subject<string>();
        const textComp = new Text({ text: subject }, zoneWrapper);

        textComp.render();
        expect(textComp.getElement().textContent).toBe('');

        subject.next('value');
        textComp.render();
        expect(textComp.getElement().textContent).toBe('value');
    });

    it('should unsubscribe on component destroy', () => {
        const subject = new BehaviorSubject('initial');
        const textComp = new Text({ text: subject }, zoneWrapper);

        textComp.render();
        expect(subject.observed).toBe(true);

        textComp.destroy();
        // RxJS 的 observed 属性在没有订阅者时为 false
        expect(subject.observed).toBe(false);
    });

    it('should trigger markDirty when Observable emits', () => {
        const subject = new BehaviorSubject('initial');
        const textComp = new Text({ text: subject }, zoneWrapper);

        // 模拟 render 过程以建立订阅
        textComp.render();

        // 清除脏标记（如果有的话）
        (textComp as any)._dirty = false;

        subject.next('new value');

        expect((textComp as any)._dirty).toBe(true);
    });
});
