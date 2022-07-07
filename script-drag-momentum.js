(() => {
    const printScale = 0.5
    const canvasScale = 5
    const canvas = document.querySelector("#canvas");
    const c = canvas.getContext('2d');
    canvas.width = window.innerWidth * canvasScale;
    canvas.height = window.innerHeight * canvasScale;
    canvas.style.width = window.innerWidth+"px";
    canvas.style.height = window.innerHeight+"px";
    c.translate(canvas.width/2,canvas.height/2);
    const stepsize = 0.0005;
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
    let currentDragged  = -1
    canvas.addEventListener('mousedown', function(event) {
        dragStart = {
            x: (event.pageX - canvas.offsetLeft - window.innerWidth/2) * canvasScale,
            y: (event.pageY - canvas.offsetTop - window.innerHeight/2) * canvasScale
        }
        let min = Infinity
        let index = -1
        let pseudoPositions = scaledPositions()
        for(let i = 0 ; i < positions.length; i++){
            let p = pseudoPositions[i]
            if(Math.sqrt(Math.pow(p[0] - dragStart.x,2) - Math.pow(p[1] - dragStart.y,2)) < min){
                min = Math.sqrt(Math.pow(p[0] - dragStart.x,2) - Math.pow(p[1] - dragStart.y,2))
                index = i
            }
        }
        currentDragged = index
    })

    canvas.addEventListener('mousemove', function(event) {
        if (currentDragged != -1) {
            dragEnd = {
                x: (event.pageX - canvas.offsetLeft - window.innerWidth/2) * canvasScale,
                y: (event.pageY - canvas.offsetTop - window.innerHeight/2) * canvasScale
            }
            positions[currentDragged][0] = dragEnd.x / (Math.min(canvas.width, canvas.height)/2 * printScale)
            positions[currentDragged][1] = dragEnd.y / (Math.min(canvas.width, canvas.height)/2 * printScale)
            
        }

    })
    canvas.addEventListener('mouseup', function(event) {
        currentDragged = -1
    })

    const alpha = 1
    const calculateGrads = (positions) => {
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
            for(let j = 0; j < adjMatrix.length; j++){
                if(i != j){
                        temp[0] +=  -1* (positions[i][0] - positions[j][0]) / 
                                    Math.pow(Math.pow(positions[i][0] - positions[j][0],2) + Math.pow(positions[i][1] - positions[j][1],2),2)
                        temp[1] +=  -1* (positions[i][1] - positions[j][1]) / 
                                    Math.pow(Math.pow(positions[i][0] - positions[j][0],2) + Math.pow(positions[i][1] - positions[j][1],2),2)
                }
            }

            temp[0] += positions[i][0]
            temp[1] += positions[i][1]
            res.push(temp)
        }
        return res
    }
    let previousPosition = JSON.parse(JSON.stringify(positions))
    const beta = 0.01
    const update = () => {
        let y = []
        for(let i = 0; i < N_VERTEX; i++){
            y.push([
                positions[i][0] + beta * (positions[i][0] - previousPosition[i][0]),
                positions[i][1] + beta * (positions[i][1] - previousPosition[i][1])
            ])
        }
        grad = calculateGrads(y)
        previousPosition = JSON.parse(JSON.stringify(positions))
        const clipTo = 10
        for(let i = 0; i < adjMatrix.length; i++){
            if(i != currentDragged || currentDragged == -1){
                positions[i][0] = y[i][0] - stepsize * (Math.sign(grad[i][0]) * Math.min(Math.abs(grad[i][0]), clipTo))
                positions[i][1] = y[i][1] - stepsize * (Math.sign(grad[i][1]) * Math.min(Math.abs(grad[i][1]), clipTo))
            }
        }
    }
    const scaledPositions = () => {
        return positions.map(p => [
            (p[0]) * Math.min(canvas.width, canvas.height)/2 * printScale,
            (p[1]) * Math.min(canvas.width, canvas.height)/2 * printScale
        ])
        
    }


    function animate(){
        requestAnimationFrame(animate)
        c.clearRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2)
        update()
        let scaledPos = scaledPositions()
        for(let i = 0; i < adjMatrix.length; i++){
            for(let j = 0; j < adjMatrix.length; j++){
                if(adjMatrix[i][j]){
                    if(i == currentDragged || j == currentDragged){
                        c.strokeStyle = "red"
                    } else {
                        c.strokeStyle = "black"
                    }
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
            if(i == currentDragged){
                c.fillStyle = "red"
            } else {
                c.fillStyle = "black"
            }
            c.arc(scaledPos[i][0], scaledPos[i][1], 20, 0, Math.PI * 2, false)
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
              borderColor: "#3e95cd",
              fill: false
            }
          ]
        },
        options: {
            scales: {
                x: {
                  display: true,
                },
                y: {
                  display: true,
                  type: 'logarithmic',
                }
              },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                  display: true,
                  text: 'Loss of the system',
                  font: {
                        size: 30
                  }
                }
            },
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
                            (1-adjMatrix[i][j]) * 1/(Math.pow(positions[i][0] - positions[j][0], 2) + Math.pow(positions[i][1] - positions[j][1], 2))+
                            1/(Math.pow(positions[i][0] - positions[j][0], 2) + Math.pow(positions[i][1] - positions[j][1], 2))
                }
            }
        }
        data.datasets[0].data.push(total);
        myChart.update();
    }, 300)
})()