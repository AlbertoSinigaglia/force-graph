(() => {
    const canvasScale = 4
    const canvas = document.querySelector("canvas");
    const c = canvas.getContext('2d');
    canvas.width = window.innerWidth * canvasScale;
    canvas.height = window.innerHeight * canvasScale;
    canvas.style.width = window.innerWidth+"px";
    canvas.style.height = window.innerHeight+"px";
    c.translate(canvas.width/2,canvas.height/2);
    const stepsize = 0.00005;
    c.strokeStyle = "#000"
    c.fillStyle = "#111"
    const N_VERTEX = 100
    const adjMatrix = Array.from({length: N_VERTEX}).map(_ => {
        return Array.from({length: N_VERTEX}).map(_ => Math.round(Math.random()))
    })
    for(let i = 0; i < N_VERTEX; i++){
        for(let j = i; j < N_VERTEX; j++){
            if(i == j) adjMatrix[i][j] = 1
            else adjMatrix[i][j] = adjMatrix[j][i]
        }
    }

    c.arc(canvas.width - canvas.width / 2,  canvas.height - canvas.height / 2, 10, 0 , Math.PI * 2, false)
    c.stroke()
    
    let positions = adjMatrix.map(_ => [Math.random() - 0.5,Math.random()  - 0.5])
    

    const alpha = 1
    const calculateGrads = () => {
        const res = []
        for(let i = 0; i < adjMatrix.length; i++){
            const temp = [0, 0];
            for(let j = 0; j < adjMatrix.length; j++){
                if(i != j){
                        temp[0] += (adjMatrix[i][j]) * 
                                (positions[i][0] - positions[j][0]) * 2
                        temp[1] += (adjMatrix[i][j]) * 
                                (positions[i][1] - positions[j][1]) * 2
                }
            }
            for(let j = 0; j < adjMatrix.length; j++){
                if(i != j){
                        temp[0] +=  -(1 - adjMatrix[i][j]) * (positions[i][0] - positions[j][0]) / 
                                    Math.pow(Math.pow(positions[i][0] - positions[j][0],2) + Math.pow(positions[i][1] - positions[j][1],2),2)
                        temp[1] +=  -(1 - adjMatrix[i][j]) * (positions[i][1] - positions[j][1]) / 
                                    Math.pow(Math.pow(positions[i][0] - positions[j][0],2) + Math.pow(positions[i][1] - positions[j][1],2),2)
                }
            }

            temp[0] += positions[i][0]
            temp[1] += positions[i][1]
            res.push(temp)
        }
        return res
    }
    const update = () => {
        grad = calculateGrads()
        for(let i = 0; i < adjMatrix.length; i++){
            positions[i][0] = positions[i][0] - stepsize * grad[i][0]
            positions[i][1] = positions[i][1] - stepsize * grad[i][1]
        }
    }
    const scaledPositions = () => {
        const maxY = Math.max(...positions.map(el => el[1]))
        const minY = Math.min(...positions.map(el => el[1]))
        const centerY = (maxY + minY)/2
        const maxX = Math.max(...positions.map(el => el[0]))
        const minX = Math.min(...positions.map(el => el[0]))
        const centerX = (maxX + minX)/2
        const scale = Math.max(
            Math.max(...positions.map(el => el[0] - centerX)),
            Math.max(...positions.map(el => el[1] - centerY))
        )
        return positions.map(p => [
            (p[0] - centerX) / scale * Math.min(canvas.width, canvas.height)/2 * 0.8,
            (p[1] - centerY) / scale * Math.min(canvas.width, canvas.height)/2 * 0.8
        ])
        
    }


    function animate(){
        requestAnimationFrame(animate)

        c.clearRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2)
        update();
        let scaledPos = scaledPositions()
        for(let i = 0; i < adjMatrix.length; i++){
            for(let j = 0; j < adjMatrix.length; j++){
                if(adjMatrix[i][j]){
                    c.beginPath()
                    c.moveTo(scaledPos[i][0], scaledPos[i][1])
                    c.lineTo(scaledPos[j][0], scaledPos[j][1])
                    c.stroke()
                    c.closePath()
                }
            }
        }
        for(let i = 0; i < adjMatrix.length; i++){ 
            c.beginPath()
            c.arc(scaledPos[i][0], scaledPos[i][1], 10, 0, Math.PI * 2, false)
            c.fill()
            c.stroke()
            c.closePath()
        }
    }
    animate()

    const ctx = document.getElementById('loss').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{ 
              data: [],
              label: "Loss",
              borderColor: "#3e95cd",
              fill: false
            }
          ]
        }
      });

    let count = 0
    setInterval(()=>{
        const data = myChart.data;
        data.labels.push(count++)
        let total = 0
        for(let i = 0; i < N_VERTEX; i++){
            for(let j = 0; j < N_VERTEX; j++){
                if(i != j){
                    total += adjMatrix[i][j] * (Math.pow(positions[i][0] - positions[j][0], 2) + Math.pow(positions[i][1] - positions[j][1], 2))+
                            (1-adjMatrix[i][j]) * 1/(Math.pow(positions[i][0] - positions[j][0], 2) + Math.pow(positions[i][1] - positions[j][1], 2))
                }
            }
        }
        data.datasets[0].data.push(total);
        myChart.update();
    }, 300)
})()