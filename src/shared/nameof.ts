// thanx - https://www.meziantou.net/typescript-nameof-operator-equivalent.htm
// @ts-ignore
export const nameof = <T>(key: keyof T, instance?: T): keyof T => {
    return key;
}