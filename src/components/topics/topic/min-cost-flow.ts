import {makeMatrix} from "../../../utils/arrays";


const INF = 1e9
export function assignment(a: Array<Array<number>>): Array<number> {
    let n = a.length
    let m = n * 2 + 2;
    let f = makeMatrix(m, m, 0)
    let s = m - 2
    let t = m - 1
    let cost = 0

    while (true) {
        let dist = new Array<number>(m).fill(INF)

        let p = new Array<number>(m);
        let inq = new Array<boolean>(m).fill(false)
        let q = []
        dist[s] = 0
        p[s] = -1
        q.push(s)
        while (q.length > 0) {
            let v = q[0];
            q = q.slice(1);
            inq[v] = false;
            if (v == s) {
                for (let i = 0; i < n; ++i) {
                    if (f[s][i] == 0) {
                        dist[i] = 0;
                        p[i] = s;
                        inq[i] = true;
                        q.push(i);
                    }
                }
            } else {
                if (v < n) {
                    for (let j = n; j < n + n; ++j) {
                        if (f[v][j] < 1 && dist[j] > dist[v] + a[v][j - n]) {
                            dist[j] = dist[v] + a[v][j - n];
                            p[j] = v;
                            if (!inq[j]) {
                                q.push(j);
                                inq[j] = true;
                            }
                        }
                    }
                } else {
                    for (let j = 0; j < n; ++j) {
                        if (f[v][j] < 0 && dist[j] > dist[v] - a[j][v - n]) {
                            dist[j] = dist[v] - a[j][v - n];
                            p[j] = v;
                            if (!inq[j]) {
                                q.push(j);
                                inq[j] = true;
                            }
                        }
                    }
                }
            }
        }

        let curcost = INF;
        for (let i = n; i < n + n; ++i) {
            if (f[i][t] == 0 && dist[i] < curcost) {
                curcost = dist[i];
                p[t] = i;
            }
        }
        if (curcost == INF)
            break;
        cost += curcost;
        for (let cur = t; cur != -1; cur = p[cur]) {
            let prev = p[cur];
            if (prev != -1)
                f[cur][prev] = -(f[prev][cur] = 1);
        }
    }
    let answer = new Array(n);
    for (let i = 0; i < n; ++i) {
        for (let j = 0; j < n; ++j) {
            if (f[i][j + n] == 1)
                answer[i] = j;
        }
    }
    return answer;
}