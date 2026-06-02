import 'core-js/full';
import 'zone.js';
import themeString from '../src/theme/css/theme.css?inlineText';
import {AppRoot, Button, createZoneWrapper, makeRef, signal} from "../src";

const zone = createZoneWrapper('my-mod-a');

const el = document.getElementById('app-root')!;

const appRoot = new AppRoot(el, {
    id: 'my-mod-app-root',
    zoneWrapper: zone,
    styleIsolation: {
        mode: 'shadow',
        styles: themeString,
    },
    style: {
        width: '400px',
        height: '300px',
        border: '1px solid #ccc',
        padding: '10px',
        margin: '10px',
    },
});

// appRoot.root.style.backgroundColor = '#f0f0f0';
appRoot.host.style.borderRadius = '8px';

appRoot.add.Label({
    id: 'text1',
    text: 'Hello, World!',
    style: {
        color: 'red',
        fontSize: '20px',
    },
});

appRoot.add.Button({
    id: 'button1',
    text: 'Click Me',
    onClick: () => alert('Button clicked!'),
    style: {
        marginTop: '10px',
        padding: '5px 10px',
    },
});

const flexContainer = appRoot.add.Flex({
    id: 'flex1',
    style: {
        flexDirection: 'column',
        marginTop: '20px',
        gap: '10px',
    },
});

flexContainer.add.Label({
    id: 'labelInFlex',
    text: 'I am inside a flex container.',
    style: {
        color: 'blue',
    },
});

// 一个类似angular的signal接口的signal，可以以alien-signals为基础进行封装，提供更适合UI组件使用的功能和类型定义，确保在组件中使用时能够自动追踪依赖并触发更新，同时在编译时提供类型安全和IDE支持
const s1 = signal('I am a signal label');

flexContainer.add.Label({
    id: 'labelInFlex',
    text: s1,
    style: {
        color: 'red',
    },
});

flexContainer.add.Button({
    id: 'buttonInFlex',
    text: 'Change Signal Label',
    onClick: () => s1.set('Signal label changed!'),
    style: {
        padding: '5px 10px',
    },
});

flexContainer.add.Button({
    id: 'buttonInFlex',
    text: 'init Label Text',
    onClick: (self: Button) => {
        // 这里的 self 是当前按钮组件实例，可以通过 self.state 来访问和修改组件状态
        // state 本身和 state 下的属性都必须是可自动推导出类型，以便IDE提供正确的类型提示，让编译期能够检查出错误
        self.state.text = 'Clicked!';
    },
});

const aOuterContextInGame = {
    userNumber: 10,
};

flexContainer.add.Button({
    id: 'buttonInFlex',
    text: () => `User Number: ${aOuterContextInGame.userNumber}`,
    onClick: (self: Button) => {
        aOuterContextInGame.userNumber += 1;
        self.markDirty(); // 手动触发重新渲染以更新文本
    },
});

const aOuterContextInMod = {
    counter: {
        a: {
            b: [
                {
                    c: 1,
                }
            ]
        }
    }
};

// makeRef 是一个全局函数，接受一个上下文对象和一个点分隔的路径字符串，返回该路径对应的值，并且会自动追踪该值的变化以触发组件更新
// makeRef 的类型定义类似于以下形式，保证可以自动推导出所有信息，确保在编译时能够检查路径的正确性，并提供类型提示
// makeRef<T, P = DotPathOf<T>, R>(context: T, path: P, formatter?: (value: ValueOfDotPathTo<T,P>) => R): R

const ref_aOuterContextInMod = makeRef(aOuterContextInMod, 'counter.a.b.0.c', (value) => `Counter: ${value}`);

// 如果aOuterContextInMod的类型已知（或可自动推导），那么此处编译时必须报错，Typescript必须能够检测出这里的点分隔路径是否正确，为IDE的类型提示提供支持
// const badRef = makeRef(aOuterContextInMod, 'counter.not.exsit.path', (value) => `Counter: ${value}`);   // this line must cause a compile error due to invalid path, which is expected and desired for better type safety and developer experience

flexContainer.add.Label({
    id: 'labelInFlex_ref_aOuterContextInMod',
    text: ref_aOuterContextInMod,
    style: {
        color: 'green',
    },
});

flexContainer.add.Button({
    id: 'buttonInFlex_ref_aOuterContextInMod',
    text: ref_aOuterContextInMod,
    onClick: (self: Button) => {
        aOuterContextInMod.counter.a.b[0]!.c += 1;
        // auto update `labelInFlex_ref_aOuterContextInMod` and `buttonInFlex_ref_aOuterContextInMod`
        // due to makeRef's internal tracking (by zonejs), no need to call markDirty
    },
});

const aOuterContextInModLogic = {
    value: 1,
    makeCheat() {
        aOuterContextInModLogic.value += 1;
    }
};

flexContainer.add.Button({
    id: 'buttonInFlex',
    text: makeRef(aOuterContextInModLogic, 'value', (value) => `Logic Value: ${value}`),
    onClick: (self: Button) => {
        aOuterContextInModLogic.makeCheat();
        // will auto update the button text due to makeRef's internal tracking (by zonejs), no need to call markDirty
    },
});

flexContainer.markDirty(); // 手动触发强制更新/同步整个容器中所有的值，并重新渲染


